import express from 'express'
import path from 'path'

import Studio from './src/Studio.js'

/**
 * Add the editor api to the server instance
 * @param {Express.Application} app The active express app
 * @param {any} config 
 */
function init(app, config) {
    const studio = new Studio(app, config)

    app.get('/API/Studio/getComponentPaths', (req, res) => studio.getComponentPaths(req, res))
    app.get('/API/Studio/openComponent', (req, res) => studio.openComponent(req, res))
    //app.use('/editor', express.static(path.join(__dirname, 'public')))
    //app.use('/editor/monaco', express.static(path.join(__dirname, 'node_modules/monaco-editor/')))
}

export default init