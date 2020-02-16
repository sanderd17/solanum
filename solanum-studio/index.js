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

        // Allow calling any function defined in the Studio API, but do check if the request is valid
        this.app.get('/API/Studio/openComponent', async (req, res) => await studio.openComponent(req, res))
        this.app.get('/API/Studio/getComponentPaths', async (req, res) => {
            let result = await studio.getComponentPaths()
            res.send(result)
        })
        this.app.use('/monaco', express.static(path.join(__dirname, 'node_modules/monaco-editor/')))
    }
}

export default SolanumStudio