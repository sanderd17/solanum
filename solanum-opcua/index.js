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

class SolanumOpcUa {
    constructor(solanum) {
        this.app = solanum.app
        this.config = solanum.config
    }

    async init() {
        await connectionManager.init(this.config.opcua)
    }
}

export default SolanumOpcUa