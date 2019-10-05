import express from 'express'


import config from './config.js'
import tags from './tags/default.js'

import {default as initCore} from 'solanum-core'
import {default as initStudio} from 'solanum-studio'
import createDemoOpcServer from './server/OpcServer.js'

const app = express()

/* OPTIONAL: add middleware to listen to all requests coming from clients
app.use(function (req, res, next) {
    return next();
});
*/

let solanumCore = initCore(app, config)
solanumCore.ts.setTags(tags)

initStudio(app, config)

app.listen(config.app.port);
console.log(`Listening on port ${config.app.port}`)

// create and start the demo server
let opcServer = createDemoOpcServer()