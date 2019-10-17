import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import jsonschema from 'jsonschema'
import connectionManager from './server/OpcUaConnectionManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


/*
Working
=======

* Config defines a number of OPC UA Connections, every connection has a name
* Config defines subscription classes (per connection or in general), every subscription class has a name
* Tags refer to an OPC ua connection a subscription by name

* On init, the connection should be made and subscriptions should be added

*/



/**
 * Add the editor api to the server instance
 * @param {Express.Application} app The active express app
 * @param {any} config 
 */
async function init(app, config) {
    await connectionManager.init(config.opcua)
    /*
    const opcua = new OpcUaAPI(app, config)

    // Allow calling any function defined in the Studio API, but do check if the request is valid
    app.get('/API/OpcUa/xyz',
        async (req, res) => {
            // TODO return some OPC UA status
            res.send("OpcUa status")
        }
    )
    */
}

export default init