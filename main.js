import path from 'path'
import express from 'express'


import config from './config.js'

import {default as initCore} from './solanum-core'
import {default as initEditor} from './solanum-editor'

const app = express()

app.use(function (req, res, next) {
    // optional middleware: listen to all requests coming from clients
    return next();
});

const guiPath = path.join(__dirname, './solanum-core/public')

initCore(app, config)
initEditor(app, guiPath)

app.listen(config.app.port);
console.log(`Listening on port ${config.app.port}`)