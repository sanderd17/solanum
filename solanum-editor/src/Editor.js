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

/**
 * An editor instance will need to be created once for the app
 * This interface offers the interface metods to read and modify
 * resources.
 */
class Editor {
    /**
     * Construct the editor interface of the app
     * @param {Express.Application} app 
     * @param {*} config JSON configuration
     */
    constructor(app, config) {
        /** Configuration of the app (see /config.js)*/
        this.config = config
        /** Object representing locked files */
        this.locks = {}
    }
}

/**
 * Finds all files from the config.editableDirs
 * and returns the paths.
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
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
    const body = req.body
    const directory = this.config.editableDirs[body.module]
    res.sendFile(path.join(directory, body.component))
}

/**
 * Update a component with new code.
 * This reads the code of a certain component, and allows a transformFn
 * to define the new code
 * TODO: transform into async function instead of callback, so Errors can be used
 */
Editor.prototype.UpdateCode = function(module, component, transformFn, cb) {
    const sourceDir = this.config.editableDirs[module]
    const fileName = path.join(sourceDir, component + '.js')
    fs.readFile(fileName,
        {encoding: 'utf-8'},
        (err, code) => {
            if (err) {
                console.log(err)
                cb(500, `Error while reading file ${fileName}: ${err}`)
                return
            }
            const newCode = transformFn(code)
            if (!newCode) {
                cb(500, `Error while setting SVG of ${fileName}; could not find SVG string to replace`)
                return
            }
            steno.writeFile(fileName, newCode,
                err => {
                    if (err) 
                        cb(500, `Error while writing file ${fileName}: ${err}`)
                    else 
                        cb(200, 'OK')
                }
            )
        }
    )
}


/**
 * Transform code of a component module by replacing the svg tagged string in the render function
 * @param {string} code to transform
 * @param {string} newSvg the svg xml to replace the old SVG with. This can include raw ${...} replacements
 * @returns {string|false} The transformed code,
 * or false if the transformed code wasn't succesful (the tagged svg string wasn't found)
 * @throws {Error} when the code can't be parsed
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
 * Clean up unneeded attributes and elements added by the online editor
 * This expects an SVG with a single group, and no other nested elements
 * 
 * Also replaces bindings with template literals
 * @param {string} svg string to parse
 * @param {any} attributes object to apply to root element
 * @returns {string} cleaned up SVG xml
 * @throws {Error} when invalid XML is passed
 */
Editor.prototype.cleanSvg = function(svg, attributes) {
    let svgData = xml2js.xml2js(svg)
    let rootElement = svgData.elements[0]
    rootElement.name = 'svg'
    rootElement.attributes = attributes

    if (!rootElement.elements)
        return xml2js.js2xml(svgData)

    // Filter out all symbol elements, those visualise child components
    rootElement.elements = rootElement.elements.filter(el => el.name != 'symbol')

    for (let group of rootElement.elements) {
        if (group.attributes && group.attributes.style) 
            delete group.attributes.style
        if (group.name == "g" && group.elements) {
            group.elements.forEach((el) => {
                if (el.name == 'use') {
                    if (el.attributes && el.attributes['xlink:href'])
                        delete el.attributes['xlink:href']
                }
                if (!el.attributes)
                    return
                // editor sets pointer styles, remove those
                if (el.attributes.style)
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
            })
        }
    }

    svgData.elements[0] = rootElement

    return xml2js.js2xml(svgData, {spaces: 4})
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

    console.log(body.svg)
    let attributes = {
        class: body.class || '',
        viewBox: `0 0 ${body.width || 100} ${body.height || 100}`,
        version: "1.1",
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    }
    const cleanSvg = this.cleanSvg(body.svg, attributes)

    this.UpdateCode(body.module, body.component, 
        (code) => this.updateSvgViaAst(code, cleanSvg),
        (status, msg) => res.status(status).send(msg))
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
    const body = req.body
    if (typeof body.module != "string")
        return res.status(400).send(`Error: No valid component name received: ${body.name}`)
    if (typeof body.component != "string")
        return res.status(400).send(`Error: No valid component name received: ${body.name}`)
}


export default Editor