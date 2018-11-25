import path from 'path'
import fs from 'graceful-fs'
import steno from 'steno'

const braceFinder = /\{([\w\.]+)\}/g
// TODO copied from template.js. Should be shared code (shared client/server utils somewhere?)
/**
 * Replace {-} parts with corresponding prop values
 * @param {string} template 
 * @returns {string} the template with {-} replacements evaluated
 */
const EvalTagPath = function(ctx, tagPath) {
    return tagPath.replace(braceFinder, (_, group) => ctx[group])
}

const template = `
import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

{childImports}

class {cmpName} extends Template {}

{cmpName}.prototype.class = 'motor'
{cmpName}.prototype.size = [500,500]
{cmpName}.prototype.css = []

{cmpName}.prototype.eventHandlers = {
    'icon_1': {
        'click':  (cmp, event) => {ts.writeTag(cmp.props.st_motor, 'black')}
    },
    'icon_2': {
        'click':  (cmp, event) => {cmp.props.size = 20}
    }
}

{cmpName}.prototype.domBindings = {domBindings}

{cmpName}.prototype.render = function() {
    return this.SVG({svg});
}

export default {cmpName}
`

class Editor {
    constructor(app, guiPath) {
        this.guiPath = guiPath
        this.locks = {}
    }
}

Editor.prototype.getComponentPaths = function(req, res) {
    const dir = path.join(this.guiPath, 'templates')
    fs.readdir(dir, (err, files) => {
        console.log('Files: ', files)
        res.send(files)
    })
}

/**
 * Get the component file to load into the editor
 * Places a lock on the file until it is released
 * @param {Request} req 
 * @param {Response} res 
 */
Editor.prototype.openComponent = function(req, res) {
    res.sendstatus(501)
}

/**
 * @typedef {object} TemplateDefinition
 * @property {string} name Name of the component, including the path. E.g. "objects/Motor"
 * @property {string} svg Inner SVG code
 */

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
Editor.prototype.saveComponent = function(req, res) {
    /** @type {TemplateDefinition} */
    const body = req.body
    if (typeof body.name != "string")
        return res.status(400).send(`Error: No valid component name received: ${body.name}`)
    if (typeof body.svg != "string") 
        return res.status(400).send(`Error: No valid svg received: ${body.svg}`)
    // context to pass on to the replacement function
    const directory = body.name + '.js'
    const ctx = {}
    ctx.cmpName = body.name.split("/").pop()
    ctx.svg = body.svg
    ctx.domBindings = JSON.stringify({})
    ctx.childImports = '' // derive from SVG

}

/**
 * Add the editor api to the server instance
 * @param {Express.Application} app The active express app
 * @param {string} guiPath 
 */
function CreateEditorApi(app, guiPath) {
    const editor = new Editor(app, guiPath)
    app.get('/API/Editor/getComponentPaths', (req, res) => editor.getComponentPaths(req, res))
    app.get('/API/Editor/openComponent', (req, res) => editor.openComponent(req, res))
    app.post('/API/Editor/saveComponent', (req, res) => editor.saveComponent(req, res))
}

export default CreateEditorApi
export {Editor} // for testing purposes only