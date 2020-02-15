import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import jsonschema from 'jsonschema'
import StudioAPI from './server/StudioAPI.js'
import * as schema from './server/StudioApiSchema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SolanumStudio {
    constructor(solanum) {
        this.solanum = solanum
        this.app = solanum.app
        this.config = solanum.config
    }

    async init() {
        const studio = new StudioAPI(this.app, this.config)

        function checkValidRequest(req, res, next) {
            let call = req.params.call
            if (!studio[call])
                return res.status(404).send(`Method ${call} not found on Studio API`)
            if (!schema[call])
                return res.status(500).send(`Method ${call} does exist, but has no schema available`)
            let result = jsonschema.validate(req.body, schema[call], {throwError: false})
            if (!result.valid)
                return res.status(400).send(`Error validating request: ${result.errors}`)
            next()
        }

        // Allow calling any function defined in the Studio API, but do check if the request is valid
        // FIXME : now both get and post are exposed, because only post can accept a body. uniformise this
        this.app.get('/API/Studio/:call',
            checkValidRequest, 
            async (req, res) => {
                let call = req.params.call
                if (call == 'openComponent') {
                    await studio.openComponent(req, res)
                    return
                }
                try{
                    let result = await studio[call](req, res)
                    res.send(result)
                } catch(e) {
                    res.status(500).send(`Error happened processing ${req.params.call}: ${e}` + '\n' + e.stack)
                }
            }
        )
        this.app.post('/API/Studio/:call',
            checkValidRequest, 
            async (req, res) => {
                try{
                    let result = await studio[req.params.call](req, res)
                    res.send(result)
                } catch(e) {
                    res.status(500).send(`Error happened processing ${req.params.call}: ${e}` + '\n' + e.stack)
                }
            }
        )
        this.app.use('/monaco', express.static(path.join(__dirname, 'node_modules/monaco-editor/')))
    }
}

export default SolanumStudio