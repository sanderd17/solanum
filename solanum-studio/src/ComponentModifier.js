import * as recast from 'recast'
import flow from 'flow-parser'

const parseOptions = {
    'parser': {
        parse: c => flow.parse(c, {
            esproposal_class_instance_fields: true,
            esproposal_class_static_fields: true,
        }), // Flow parser supports class fields https://github.com/tc39/proposal-class-fields
    }
}

/**
 * Class to allow modifications to component code.
 * This is based on a fixed structure of the components
 * and uses AST parsing to maintain formatting and functionality of
 * the existing code.
 */
class ComponentModifier {

    /**
     * Parse the complete module code to AST, ready for modifications
     * @param {string} code 
     */
    constructor(code) {
        this.code = code
        this.ast = recast.parse(code, parseOptions)
    }

    /**
     * @returns {string} new module code
     */
    print() {
        return recast.print(this.ast).code
    }

    /**
     * @param {string} childId: id under which the child component will be referenced
     * @param {string} childPath: path to the child component 
     * @param {string} childClassName: Class name of the child component
     * @param {*} position: Without position, child cannot be displayed
     */
    addChildComponent(childId, childClassName, childPath, position) {
        this.addImportStatement(childClassName, childPath)

        let children = this.getClassField('children')

        let newChildAst = recast.parse(`
            let _ = new ${childClassName}({
                parent: this,
                position: {},
                props: {},
                eventHandlers: {},
            })`, parseOptions)

        const b = recast.types.builders
        let newArgProperty = b.property('init', b.identifier(childId), newChildAst.program.body[0].declarations[0].init)
        // TODO order keys alphabeticlly by default?
        children.properties.splice(children.properties.length, 0, newArgProperty)

        this.setChildPosition(childId, position)
    }

    /**
     * Remove a child with a given id
     * @param {string} childId 
     */
    removeChildComponent(childId) {
        let children = this.getClassField('children')

        for (let [i, prop] of children.properties.entries()) {
            if (prop.key.name == childId)
                children.properties.splice(i, 1)
        }
    }

    /**
     * @param {string} childId 
     * @param {string} position 
     */
    setChildPosition(childId, position) {
        let childArg = this.getChildDefinition(childId)

        if (!childArg) {
            throw new Error(`Could not find the constructor arguments of child ${childId}`)
        }
        // construct the position object ast
        const b = recast.types.builders
        let objProps = []
        for (let key in position) {
            objProps.push(b.property('init', b.identifier(key), b.literal(position[key])))
        }
        let objAst  = b.objectExpression(objProps)

        // replace the existing object with the new ast
        for (let prop of childArg.properties) {
            if (!prop.key || prop.key.name != 'position')
                continue
            prop.value = objAst
        }
    }

    setChildProp() {

    }

    removeChildProp() {

    }

    /**
     * @param {string} childId 
     * @param {string} eventId 
     * @param {string} eventHandler representing the function as a string
     */
    setChildEventHandler(childId, eventId, eventHandler) {
        let childArg = this.getChildDefinition(childId)

        let newEventhandlerAst = recast.parse(eventHandler, parseOptions).program.body[0].expression

        for (let prop of childArg.properties) {
            if (prop.key.name != 'eventHandlers')
                continue
            if (prop.value.type != 'ObjectExpression')
                throw new Error('eventHandlers parameter should be of type `ObjectExpression`')
            for(let handler of prop.value.properties) {
                if (handler.key.name == eventId) {
                    handler.value = newEventhandlerAst
                    return
                }
            }
            // handler with id was not found, add a new handler

            const b = recast.types.builders
            let newHandlerProperty = b.property('init', b.identifier(eventId), newEventhandlerAst)
            prop.value.properties.splice(prop.value.properties.length, 0, newHandlerProperty)
        }
    }

    removeChildEventHandler(childId, eventId) {
        let childArg = this.getChildDefinition(childId)

        for (let prop of childArg.properties) {
            if (prop.key.name != 'eventHandlers')
                continue
            if (prop.value.type != 'ObjectExpression')
                throw new Error('eventHandlers parameter should be of type `ObjectExpression`')
            for(let [i, handler] of prop.value.properties.entries()) {
                if (handler.key.name == eventId) {
                    prop.value.properties.splice(i, 1) // remove the handler
                    return
                }
            }
        }
    }

    setDefaultProp(propName, value) {
        const b = recast.types.builders
        let newValue = b.literal(value) // TODO this only supports numbers and strings as values. All JSON values should be supported

        let defaultProps = this.getClassField('defaultProps')
        if (defaultProps.type != 'ObjectExpression')
            throw new Error('defaultProps is not detected as an object')
        for (let prop of defaultProps.properties) {
            if (prop.key.type != 'Identifier')
                continue
            if (prop.key.name != propName)
                continue
            prop.value = newValue            
            return
        }

        // no existing prop found, add a new one
        let newDefaultProperty = b.property('init', b.identifier(propName), newValue)
        defaultProps.properties.splice(defaultProps.properties.length, 0, newDefaultProperty)
    }

    removeDefaultProp(propName) {
        let defaultProps = this.getClassField('defaultProps')
        if (defaultProps.type != 'ObjectExpression')
            throw new Error('defaultProps is not detected as an object')
        for (let [i, prop] of defaultProps.properties.entries()) {
            if (prop.key.type != 'Identifier')
                continue
            if (prop.key.name != propName)
                continue
            defaultProps.properties.splice(i, 1)
            return
        }
    }

    //////////////////////////
    // INTERNAL USE METHODS //
    //////////////////////////

    /**
     * Add the import of a new class to a component
     * Checks existing default imports to avoid duplicates,
     * and adds a new default import with the given names
     * @param {string} importName 
     * @param {string} importPath 
     */
    addImportStatement(importName, importPath) {
        const astBody = this.ast.program.body
        let lastImportLine = -1
        for (let [i, statement] of astBody.entries()) {
            if (statement.type != 'ImportDeclaration')
                continue
            lastImportLine = i
            if (statement.source.value == importPath)
                return
        }

        // determine the position of the import (add to the end of imports)
        let importString = `import ${importName} from '${importPath}'`

        let newImportAst = recast.parse(importString, parseOptions).program.body[0]
        astBody.splice(lastImportLine + 1,0,newImportAst)
    }

    getClassBodyAst() {
        const astBody = this.ast.program.body
        for (let statement of astBody) {
            if (statement.type != 'ClassDeclaration')
                continue

            return statement.body.body
        }
    }

    /**
     * 
     * @param {string} childId Id of the child to get the arguments from
     * @returns {ObjectExpression} containing the different arguments (position, props and eventhandlers)
     */
    getChildDefinition(childId) {
        let children = this.getClassField('children')

        for (let prop of children.properties) {
            if (prop.key.name != childId)
                continue
            let childCreation = prop.value
            if (childCreation.type != 'NewExpression')
                continue
            if (childCreation.arguments.length != 1)
                continue
            return childCreation.arguments[0]
        }
    }

    /**
     * Get a class field
     * TODO: this currently uses prototype variables
     * When esprima can handle class fields, those will need to be transformed to class fields
     * @param {string} fieldName 
     * @returns {Expression} value of the class field with give name
     */
    getClassField(fieldName) {
        let classBodyAst = this.getClassBodyAst();

        for (let statement of classBodyAst) {
            if (statement.type != 'ClassProperty')
                continue
            if (!statement.key || statement.key.type != 'Identifier')
                continue
            if (statement.key.name != fieldName)
                continue
            return statement.value
        }
    }
}

export default ComponentModifier