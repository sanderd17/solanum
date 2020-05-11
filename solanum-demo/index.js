import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'

import config from './config.js'

import Solanum from 'solanum-core'
import SolanumOpcUa from 'solanum-opcua'
import SolanumStudio from 'solanum-studio'
import createDemoOpcServer from './server/OpcServer.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()

/* OPTIONAL: add middleware to listen to all requests coming from clients
app.use(function (req, res, next) {
    return next();
});
*/

let solanum = new Solanum(app, config)
solanum.addModule(SolanumOpcUa)
solanum.addModule(SolanumStudio)

solanum.init()
solanum.ts.setTags('default', path.join(__dirname, './tags/default.js'))

app.listen(config.app.port);
console.log(`Listening on port ${config.app.port}`)

// create and start the demo server
let opcServer = createDemoOpcServer()