import express from 'express'
import path from 'path'

import Editor from './src/Editor.js'

/**
 * Add the editor api to the server instance
 * @param {Express.Application} app The active express app
 * @param {string} guiPath 
 */
function init(app, guiPath) {
    const editor = new Editor(app, guiPath)

    app.get('/API/Editor/getComponentPaths', (req, res) => editor.getComponentPaths(req, res))
    app.get('/API/Editor/openComponent', (req, res) => editor.openComponent(req, res))
    app.post('/API/Editor/setComponentSvg', (req, res) => editor.setComponentSvg(req, res))
    app.use('/editor', express.static(path.join(__dirname, 'public')))
    app.use('/editor/svgedit', express.static(path.join(__dirname, 'node_modules/svgedit/editor')))
}

export default init