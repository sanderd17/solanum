import path from 'path'

import express from 'express'
import bodyParser from 'body-parser'
import expressWs from 'express-ws'

import Client from './src/Client.js'
import clientList from './src/ClientList.js'
import ts from './src/TagSet.js'

function init(app, config) {

    expressWs(app)
    app.use(bodyParser.json()) // auto parse json into req.body

    const guiPath = path.join(__dirname, '../solanum-core/public')
    app.use(express.static(guiPath))
    app.use('/scripts', 
        express.static(path.join(__dirname, '../node_modules')))

    ts.initMessageHandlers()
    ts.setTags()

    // @ts-ignore -- Wait until websockets are native in express
    app.ws('/socket', function(ws, req) {
        let cl = new Client(ws, req.connection.remoteAddress)
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
}

export default init
