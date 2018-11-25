import path from 'path'

import config from './config.js'

import express from 'express'
import bodyParser from 'body-parser'
const app = express()
const expressWs = require('express-ws')(app)

import CreateEditor from './src/Editor.js'
import Client from './src/Client.js'
import clientList from './src/ClientList.js'
import ts from './src/TagSet.js'

const guiPath = path.join(__dirname, '../gui')
ts.initMessageHandlers()
ts.setTags()

app.use(function (req, res, next) {
    // console.log('middleware');
    return next();
});
app.use(bodyParser.json()) // auto parse json into req.body


app.use(express.static(guiPath))
app.use('/editor/svgedit', express.static(path.join(__dirname, '../node_modules/svgedit/editor')))

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

CreateEditor(app, guiPath)

app.listen(config.app.port);
console.log(`Listening on port ${config.app.port}`)
