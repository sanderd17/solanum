import jsonschema from 'jsonschema'
import StudioAPI from './src/StudioAPI.js'
import * as schema from './src/StudioApiSchema.js'


/**
 * Add the editor api to the server instance
 * @param {Express.Application} app The active express app
 * @param {any} config 
 */
function init(app, config) {
    const studio = new StudioAPI(app, config)

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
    app.get('/API/Studio/:call',
        checkValidRequest, 
        async (req, res) => {
            try{
                await studio[req.params.call](req, res)
            } catch(e) {
                res.status(500).send(`Error happened processing ${req.params.call}: ${e}` + '\n' + e.stack)
            }
        }
    )
    app.post('/API/Studio/:call',
        checkValidRequest, 
        async (req, res) => {
            try{
                await studio[req.params.call](req, res)
            } catch(e) {
                res.status(500).send(`Error happened processing ${req.params.call}: ${e}` + '\n' + e.stack)
            }
        }
    )
    //app.use('/editor', express.static(path.join(__dirname, 'public')))
    //app.use('/editor/monaco', express.static(path.join(__dirname, 'node_modules/monaco-editor/')))
}

export default init