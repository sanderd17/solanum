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
 * @typedef {object} TemplateDefinition
 * @property {string} module Name of the module the component is from
 * @property {string} component Name of the component, including the path. E.g. "objects/Motor"
 * @property {string} svg Inner SVG code
 * @property {string} class
 * @property {number} width
 * @property {number} height
 */
/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
Editor.prototype.setComponentSvg = function(req, res) {
    /** @type {TemplateDefinition} */
    const body = req.body
    if (typeof body.module != "string")
        return res.status(400).send(`Error: No valid component name received: ${body.name}`)
    if (typeof body.component != "string")
        return res.status(400).send(`Error: No valid component name received: ${body.name}`)
    if (typeof body.svg != "string") 
        return res.status(400).send(`Error: No valid svg received: ${body.svg}`)
    let svgData = xml2js.xml2js(body.svg)

    console.log(body.svg)
    let rootElement = svgData.elements[0]
    rootElement.name = 'svg'
    rootElement.attributes = {
        class: body.class || '',
        viewBox: `0 0 ${body.width || 100} ${body.height || 100}`,
        version: "1.1",
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    }

    // Filter out all symbol elements, those visualise child components
    rootElement.elements = rootElement.elements.filter(el => el.name != 'symbol')
    let gElement = rootElement.elements[0]
    if (gElement.attributes.style)
        delete gElement.attributes.style
    gElement.elements.forEach((el) => {
            // editor sets pointer styles, remove those
            if (el.attributes && el.attributes.style)
                delete el.attributes.style
            // remove null attributes automatically added by editor
            for (let at in el.attributes) {
                if (el.attributes[at] == 'null')
                    delete el.attributes[at]
            }
            // alter the ids
            if (el.attributes && el.attributes.id)
                el.attributes.id = el.attributes.id.replace(/^id-/, '')
            // replace use elements by references to their child components
            if (el.name == 'use') {
                if (el.attributes && el.attributes['xlink:href'])
                    delete el.attributes['xlink:href']
            }
        })
    svgData.elements[0] = rootElement

    const reparsedSvg = xml2js.js2xml(svgData, {spaces: 4})

    const sourceDir = this.config.editableDirs[body.module]
    const fileName = path.join(sourceDir, body.component)
    // FIXME Hard-coded path should refer to correct js file
    fs.readFile(fileName,
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
            steno.writeFile(fileName, newCode,
                err => {
                    if (err) 
                        res.status(500).send(`Error while writing file ${fileName}: ${err}`)
                    else 
                        res.status(200).send('OK')
                }
            )
        }
    )
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


export default Editor