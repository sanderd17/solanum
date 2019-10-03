import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import jsonschema from 'jsonschema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Add the editor api to the server instance
 * @param {Express.Application} app The active express app
 * @param {any} config 
 */
function init(app, config) {
    const opcua = new OpcUaAPI(app, config)

    // Allow calling any function defined in the Studio API, but do check if the request is valid
    app.get('/API/OpcUa/xyz',
        async (req, res) => {
            // TODO return some OPC UA status
            res.send("OpcUa status")
        }
    )
}

export default init