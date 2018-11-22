import config from './config.js'

import path from 'path'
const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)

import Client from "./src/Client.js"
import clientList from "./src/ClientList.js"
import ts from './src/TagSet.js'


ts.initMessageHandlers()
ts.setTags()

app.use(function (req, res, next) {
    // console.log('middleware');
    return next();
});

app.use(express.static(path.join(__dirname, '../gui')))
app.use('/editor', express.static(path.join(__dirname, '../node_modules/svgedit/editor')))

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

app.listen(config.app.port);
console.log(`Listening on port ${config.app.port}`)
