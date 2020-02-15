import express from 'express'


import config from './config.js'
import tags from './tags/default.js'


import Solanum from 'solanum-core'
import SolanumOpcUa from 'solanum-opcua'
import SolanumStudio from 'solanum-studio'
import createDemoOpcServer from './server/OpcServer.js'

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
solanum.ts.setTags(tags)

app.listen(config.app.port);
console.log(`Listening on port ${config.app.port}`)

// create and start the demo server
let opcServer = createDemoOpcServer()