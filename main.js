import express from 'express'


import config from './config.js'

import {default as initCore} from './solanum-core'
import {default as initStudio} from './solanum-studio'

const app = express()

/* optional middleware: listen to all requests coming from clients
app.use(function (req, res, next) {
    return next();
});
*/

initCore(app, config)
initStudio(app, config)

app.listen(config.app.port);
console.log(`Listening on port ${config.app.port}`)