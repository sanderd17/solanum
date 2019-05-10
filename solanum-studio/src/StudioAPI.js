import recast from 'recast'
import jsonschema from 'jsonschema'
import ComponentStore from './ComponentStore.js'


/*
Studio should provide methods to set different parts of the code:

Every operation should be atomic, so simultaneous edits can be made without corrupting the code.
Syntax validation should be done before saving the code, in case of a syntax error, the error should be returned to the interface

* Add / Remove new child template (and fix imports)
* Set position of child template
* Set props object of child template
* Set default props of own template
* Add / remove / change event handlers
 */

/**
 * An editor instance will need to be created once for the app
 * This interface offers the interface metods to read and modify
 * resources.
 */
class StudioAPI {
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
        this.componentStore = new ComponentStore(config)
    }

    /**
     * Finds all files from the config.editableDirs
     * and returns the paths.
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    async getComponentPaths(req, res) {
        let filesPerModule = await this.componentStore.getComponentPaths()
        res.send(filesPerModule)
    }

    /**
     * Get the component file to load into the editor
     * @param {Request} req 
     * @param {Response} res 
     */
    async openComponent(req, res) {
        const body = req.body
        res.sendFile(this.componentStore.getComponentPath(body.module, body.component))
    }
}

/**
 * Update or add an event handler to code 
 * 
 * @param {string} moduleCode
 * @param {string} objectId
 * @param {string} eventName
 * @param {recast.ast} newFunctionAst
 */
StudioAPI.prototype.updateEventHandlerViaAst = function(moduleCode, objectId, eventName, newFunctionAst) {
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

StudioAPI.prototype.setComponentEventHandler = async function(req, res) {
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


    let file = this.componentStore.getFile(body.module, body.component)
    let oldCode = await file.read()

    let newCode = this.updateEventHandlerViaAst(oldCode, body.objectId, body.eventType, newFunctionAst)

    await file.write(newCode)

    res.send("OK")
}


export default StudioAPI