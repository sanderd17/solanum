import path from 'path'
import fs from 'graceful-fs'
const xml2js =require('xml-js')
import steno from 'steno'
const recast = require('recast')
import readdir from 'recursive-readdir'


const braceFinder = /\{([\w\.]+)\}/g
// TODO copied from template.js. Should be shared code (shared client/server utils somewhere?)
/**
 * Replace {-} parts with corresponding prop values
 * @param {object} ctx
 * @param {string} template 
 * @returns {string} the template with {-} replacements evaluated
 */
const ReplaceBraces = function(ctx, template) {
    return template.replace(braceFinder, (_, group) => group in ctx ? ctx[group] : '{' + group + '}')
}

const template = `
import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

//{childImports}

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

{cmpName}.prototype.domBindings = {
     icon_1: {
        fill: {
            type: 'tag',
            tagPath: '{st_motor}',
        }
    },
    icon_2: {
        width: {
            type: 'prop',
            propName: 'icon_size'
        } 
    },
}

{cmpName}.prototype.render = function() {
    return this.svg\`{svg}\`
}

export default {cmpName}
`

class Editor {
    constructor(app, config) {
        this.config = config
        this.locks = {}
    }
}

Editor.prototype.getComponentPaths = async function(req, res) {
    const modules = Object.keys(this.config.editableDirs)
    const editableDirs = modules.map((k) => this.config.editableDirs[k])

    const fileLists = await Promise.all(
        editableDirs.map(dir => readdir(dir))
    )
    const filesPerModule = modules.reduce((obj, k, i) => ({...obj, [k]: fileLists[i] }), {})

    for (let key in filesPerModule) {
        let prefixLength = this.config.editableDirs[key].length
        filesPerModule[key] = filesPerModule[key].map(f => f.substring(prefixLength))
    }

    res.send(filesPerModule)
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
 * Transform code of a component module by replacing the svg tagged string in the render function
 * @param {string} code to transform
 * @param {string} newSvg the svg xml to replace the old SVG with. This can include raw ${...} replacements
 * @returns {string|false} The transformed code,
 * or false if the transformed code wasn't succesful (the tagged svg string wasn't found)
 */
Editor.prototype.updateSvgViaAst = function(code, newSvg) {
    const ast = recast.parse(code, {sourceType: 'module'})

    const astBody = ast.program.body
    for (let statement of astBody) {
        if (statement.type != 'ExpressionStatement')
            continue
        let expr = statement.expression
        if (expr.type != 'AssignmentExpression' ||
            expr.left.type != 'MemberExpression' ||
            expr.right.type != 'FunctionExpression' ||
            expr.left.property.type != 'Identifier' ||
            expr.left.property.name != 'render')
            continue
        // expr.right is the render function
        let fnBody = expr.right.body
        if (fnBody.type != 'BlockStatement')
            continue
        for (let renderStatement of fnBody.body) {
            if (renderStatement.type != 'ReturnStatement' ||
                renderStatement.argument.type != 'TaggedTemplateExpression' ||
                renderStatement.argument.quasi.type != 'TemplateLiteral')
                continue
            // renderStatement.argument.quasi is the contents of the tagged svg string
            const newSvgAst = recast.parse('`' + newSvg  + '`')
            renderStatement.argument.quasi = newSvgAst.program.body[0].expression
            // return the printed version
            return recast.print(ast).code
        }
    }
    return false
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
Editor.prototype.setComponentSvg = function(req, res) {
    /** @type {TemplateDefinition} */
    const body = req.body
    console.log(body)
    if (typeof body.name != "string")
        return res.status(400).send(`Error: No valid component name received: ${body.name}`)
    if (typeof body.svg != "string") 
        return res.status(400).send(`Error: No valid svg received: ${body.svg}`)
    // context to pass on to the replacement function
    const fileName = body.name + '.js'

    let svgData = xml2js.xml2js(body.svg)

    // TODO filter out the <use> elements
    for (let element of svgData.elements) {
        if (element.attributes && element.attributes.style)
            delete element.attributes.style
    }

    const reparsedSvg = xml2js.js2xml(svgData, {spaces: 4});
    // FIXME Hard-coded path should refer to correct js file
    fs.readFile(__dirname + '/../../solanum-core/public/templates/Motor.js',
        {encoding: 'utf-8'},
        (err, code) => {
            if (err) {
                console.log(err)
                res.status(500).send(`Error while reading file ${fileName}: ${err}`)
                return
            }
            const newCode = this.updateSvgViaAst(code, reparsedSvg)
            if (newCode == false) {
                res.status(500).send(`Error while setting SVG of ${fileName}; could not find SVG string to replace`)
                return
            }
            steno.writeFile(this.guiPath + '/' + fileName, newCode,
                err => {
                    if (err) 
                        res.status(500).send(`Error while writing file ${fileName}: ${err}`)
                    else 
                        res.status(200).send('OK')
                }
            )
        }
    )
    // Open component from file
    // Take through AST parser
    // Set SVG
    // Store to file
}

Editor.prototype.setComponentDomBinding = function(req, res) {
    // Open component from file
    // Take through AST
    // Set dom binding from type
    // Store to file
}

Editor.prototype.setComponentEventHandler = function(req, res) {
    // Open component from file
    // Take through AST
    // Set dom binding from type
    // Store to file
}

/**
 * @typedef {object} TemplateDefinition
 * @property {string} name Name of the component, including the path. E.g. "objects/Motor"
 * @property {string} svg Inner SVG code
 */

export default Editor