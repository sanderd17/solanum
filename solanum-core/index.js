import path from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import bodyParser from 'body-parser'
import expressWs from 'express-ws'

import ClientConnection from './server/ClientConnection.js'
import clientList from './server/ClientList.js'
import TagSet from './server/TagSet.js'
import Reloader from './server/Reloader.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class Solanum {
    constructor(app, config) {
        this.app = app
        this.config = config
        this.ts = new TagSet(config)
        this.ts.initMessageHandlers()
    }
}

function init(app, config) {

    expressWs(app)
    app.use(bodyParser.json({'limit': '10MB'})) // auto parse json into req.body

    for (let dir of config.publicDirs) {
        app.use(express.static(dir))
    }
    app.use('/scripts', 
        express.static(path.join(__dirname, '../node_modules')))

    // @ts-ignore -- Wait until websockets are native in express
    app.ws('/socket', function(ws, req) {
        let cl = new ClientConnection(ws, req.connection.remoteAddress)
        clientList.add(cl)

        console.log('Added new client: # ' + clientList.size)
        ws.on('close', function(msg) {
            // Delete from the client list
            for (let cl of clientList) {
                if (cl.ws == ws) {
                    clientList.delete(cl)
                }
            }
            console.log('Removed client: # ' + clientList.size)
        })
    })

    let reloader = new Reloader(app, config)

    return new Solanum(app, config)
}


export default init
