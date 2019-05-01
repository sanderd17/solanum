import path from 'path'
import fs from 'graceful-fs'
import steno from 'steno'
import recast from 'recast'
import readdir from 'recursive-readdir'
import jsonschema from 'jsonschema'

/**
 * An editor instance will need to be created once for the app
 * This interface offers the interface metods to read and modify
 * resources.
 */
class Studio {
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
Studio.prototype.getComponentPaths = async function(req, res) {
    const modules = Object.keys(this.config.editableDirs)
    const editableDirs = modules.map((k) => this.config.editableDirs[k])

    const fileLists = await Promise.all(
        editableDirs.map(dir => readdir(dir))
    )
    const filesPerModule = modules.reduce((obj, k, i) => ({...obj, [k]: fileLists[i] }), {})

    for (let key in filesPerModule) {
        let prefixLength = this.config.editableDirs[key].length
        filesPerModule[key] = filesPerModule[key].map(f => f.substring(prefixLength)).sort()
    }

    res.send(filesPerModule)
}

/**
 * Get the component file to load into the editor
 * Places a lock on the file until it is released
 * @param {Request} req 
 * @param {Response} res 
 */
Studio.prototype.openComponent = function(req, res) {
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
Studio.prototype.UpdateCode = function(module, component, transformFn, cb) {
   // TODO lock file while writing and wait with writing if lock is present
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

Studio.prototype.setComponentDomBinding = function(req, res) {
    // Open component from file
    // Take through AST
    // Set dom binding from type
    // Store to file
}

/**
 * Update or add an event handler to code 
 * 
 * @param {string} moduleCode
 * @param {string} objectId
 * @param {string} eventName
 * @param {recast.ast} newFunctionAst
 */
Studio.prototype.updateEventHandlerViaAst = function(moduleCode, objectId, eventName, newFunctionAst) {
    const ast = recast.parse(moduleCode, {sourceType: 'module'})

    // ast builders that can be called when needed
    const b = recast.types.builders
    let getEventProp = () => b.property('init', b.identifier(eventName), newFunctionAst)
    let getObjProp = () => b.property('init', b.identifier(objectId), b.objectExpression([getEventProp()]))
    let getDomBindingsObj = (className) => b.expressionStatement(
            b.assignmentExpression(
                '=', 
                b.memberExpression(
                    b.memberExpression(
                        b.identifier(className),   // className
                        b.identifier('prototype')  // .property
                    ),
                    b.identifier('domBindings')    // .domBindings
                ),                                 // =
                b.objectExpression([getObjProp()]) // {Object}
            )
        )

    let className, insertPos = 0
    const astBody = ast.program.body
    for (let statement of astBody) {
        if (!className)
            insertPos++
        if (statement.type == 'ClassDeclaration') {
            className = statement.id.name
        }
        if (statement.type != 'ExpressionStatement')
            continue
        let expr = statement.expression
        if (expr.type != 'AssignmentExpression' ||
            expr.left.type != 'MemberExpression' ||
            expr.right.type != 'ObjectExpression' ||
            expr.left.property.type != 'Identifier' ||
            expr.left.property.name != 'domBindings')
            continue
        // expr.right is the domBindings object
        
        let domBindings = expr.right
        // loop over the elements
        for (let el of domBindings.properties) {
            if (el.type != 'Property' ||
                (el.key.value != objectId && el.key.name != objectId) ||
                el.value.type != 'ObjectExpression')
                continue
            for (let event of el.value.properties) {
                if (event.type != 'Property' ||
                    (event.key.value != eventName && event.key.name != eventName))
                    continue
                event.value = newFunctionAst
                return recast.print(ast).code
            }
            // event not found, add it
            el.value.properties.splice(el.value.properties.length, 0, getEventProp())
            return recast.print(ast).code
        }
        // object id not found, add it
        domBindings.properties.splice(domBindings.properties.length, 0, getObjProp())
        return recast.print(ast).code
    }
    if (className) {
        astBody.splice(insertPos, 0, getDomBindingsObj(className))
        return recast.print(ast).code
    }

    return false
}

const componentEventHandlerSchema = {
    type: 'object',
    properties: {
        module: {type: 'string', required: true},
        component: {type: 'string', required: true},
        objectId: {type: 'string', required: true},
        eventType: {type: 'string', required: true},
        function: {type: 'string', required: false},
    }
}

Studio.prototype.setComponentEventHandler = function(req, res) {
    // Open component from file
    // Take through AST
    // Set dom binding from type
    // Store to file
    const body = req.body
    let result = jsonschema.validate(body, componentEventHandlerSchema, {throwError: false})
    if (!result.valid)
        return res.status(400).send(`Error validating request: ${result.errors}`)

    const newFunctionAst = recast.parse(body.function)

    console.log(recast.prettyPrint(newFunctionAst, { tabWidth: 2 }).code)
    this.UpdateCode(body.module, body.component, 
        (code) => this.updateEventHandlerViaAst(code, newFunctionAst),
        (status, msg) => res.status(status).send(msg))
}


export default Studio