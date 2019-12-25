import recast from 'recast'
import flow from 'flow-parser'

import {getObjectPropertyByName, getClassField, getChildDefinition, getChildProps} from '../public/lib/AstNavigator.js'

const parseOptions = {
    'parser': {
        parse: c => flow.parse(c, {
            esproposal_class_instance_fields: true,
            esproposal_class_static_fields: true,
        }), // Flow parser supports class fields https://github.com/tc39/proposal-class-fields
    }
}

const b = recast.types.builders
function valueToAst(value) {
    if (value instanceof Array)
        throw new Error('Array props are not implemented yet')
    if (value instanceof Object)
        throw new Error('Object props are not implemented yet')
    // primitive value
    return b.literal(value)
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
        /** @type {recast.types.namedTypes.File} */
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

        let children = getClassField(this.ast, 'children')
        if (children == undefined) {
            // TODO create children object
        }

        if (children.value.type != "ObjectExpression")
            throw new Error(`Children on class are not defined as an object`)

        let existingChild = getObjectPropertyByName(children.value, childId)
        if (existingChild != undefined) 
            throw new Error(`There is already a child defined with id ${childId}`)


        let newChildProperty = b.property('init',
            b.identifier(childId),
            b.newExpression(
                b.identifier(childClassName),
                [
                    b.objectExpression([
                        b.property('init', b.identifier('parent'), b.thisExpression()),
                        b.property('init', b.identifier('position'), b.objectExpression([])),
                        b.property('init', b.identifier('properties'), b.objectExpression([])),
                        b.property('init', b.identifier('eventHandlers'), b.objectExpression([]))
                    ])
                ]
            )
        )
        children.value.properties.splice(0, 0, newChildProperty)
        this.sortObjectProperties(children.value)
        this.setChildPosition(childId, position)
    }

    /**
     * Remove a child with a given id
     * @param {string} childId 
     */
    removeChildComponent(childId) {
        let children = getClassField(this.ast, 'children')
        if (children == undefined) {
            return
        }

        if (children.value.type != "ObjectExpression") {
            throw new Error(`Children were not defined as an object`)
        }
        this.removeKeyFromObject(children.value, childId)
    }

    /**
     * @param {string} childId 
     * @param {{string}} position 
     */
    setChildPosition(childId, position) {
        let childArg = getChildDefinition(this.ast, childId)

        if (!childArg) {
            throw new Error(`Could not find the constructor arguments of child ${childId}`)
        }
        // construct the position object ast
        let objProps = []
        for (let key in position) {
            objProps.push(b.property('init', b.identifier(key), b.literal(position[key])))
        }
        let objAst  = b.objectExpression(objProps)
        let positionProperty = getObjectPropertyByName(childArg, 'position')
        if (positionProperty == undefined) {
            // TODO add it
        }
        positionProperty.value = objAst
    }

    setChildProp(childId, propName, value) {
        if (!this.testValidPropName(propName)) {
            throw new Error(`Cannot add prop with name ${propName}. Only ASCII characters are allowed, starting with a letter and only containing letters, underscores and numbers`)
        }

        let childProps = getChildProps(this.ast, childId)

        let property = getObjectPropertyByName(childProps, propName)
        if (property == undefined) { 
            let newProp = b.property('init', b.identifier(propName), valueToAst(value))
            childProps.properties.splice(0, 0, newProp)
            this.sortObjectProperties(childProps)
        } else {
            property.value = valueToAst(value)
        }
    }

    removeChildProp(childId, propName) {
        let childProps = getChildProps(this.ast, childId)

        if (childProps == undefined)
            return
        this.removeKeyFromObject(childProps, propName)
    }

    /**
     * @param {string} childId 
     * @param {string} eventId 
     * @param {string} eventHandler representing the function as a string
     */
    setChildEventHandler(childId, eventId, eventHandler) {
        let childArg = getChildDefinition(this.ast, childId)

        let newEventhandlerAst = recast.parse(eventHandler, parseOptions).program.body[0].expression

        let eventHandlers = getObjectPropertyByName(childArg, 'eventHandlers')

        if (eventHandlers == undefined) {
            eventHandlers = b.property('init', b.identifier('eventHandlers'), b.objectExpression([]))
            childArg.properties.splice(0, 0, eventHandlers)
            this.sortObjectProperties(childArg)
        }

        if (eventHandlers.value.type != 'ObjectExpression')
            throw new Error(`Event handlers for child ${childId} were not defined as an object`)

        let existingHandler = getObjectPropertyByName(eventHandlers.value, eventId)
        if (existingHandler == undefined) {
            let newHandlerProperty = b.property('init', b.identifier(eventId), newEventhandlerAst)
            eventHandlers.value.properties.splice(0, 0, newHandlerProperty)
            this.sortObjectProperties(eventHandlers.value)
        } else {
            existingHandler.value = newEventhandlerAst
        }
    }

    removeChildEventHandler(childId, eventId) {
        let childArg = getChildDefinition(this.ast, childId)

        let handlers = getObjectPropertyByName(childArg, "eventHandlers")
        if (handlers == undefined)
            return
        if (handlers.value.type != 'ObjectExpression')
            throw new Error('eventHandlers parameter should be of type `ObjectExpression`')
        this.removeKeyFromObject(handlers.value, eventId)
    }

    /**
     * @param {string} propName 
     */
    testValidPropName(propName) {
        const validPropName = /^[a-zA-Z]+\w*$/
        return validPropName.test(propName)
    }

    setProp(propName, value) {
        let propertiesAst = getClassField(this.ast, 'properties').value
        if (propertiesAst == undefined) {
            // TODO create a new properties class field
        }

        if (propertiesAst.type != "ObjectExpression")
            throw new Error(`Properties field was not defined as an object`)

        let property = getObjectPropertyByName(propertiesAst, propName)
        if (property == undefined) {
            let newPropertyAst = b.property('init',
                b.identifier(propName),
                b.newExpression(
                    b.identifier("Prop"),
                    [
                        b.literal(value)
                    ]
                )
            )
            propertiesAst.properties.splice(0, 0, newPropertyAst)
            this.sortObjectProperties(propertiesAst)
        } else {
            if (property.value.type != "NewExpression")
                throw new Error(`Property ${propName} is not a new object`)
            if (property.value.arguments.length != 1)
                throw new Error(`Property ${propName} requires 1 argument, ${property.value.arguments.length} given`)

            property.value.arguments[0] = b.literal(value)
        }
    }

    removeProp(propName) {
        let propertiesAst = getClassField(this.ast, 'properties').value
        if (propertiesAst.type != 'ObjectExpression')
            throw Error("Properties of component were not defined as an object")
        this.removeKeyFromObject(propertiesAst, propName)
    }

    //////////////////////////
    // INTERNAL USE METHODS //
    //////////////////////////

    /**
     * @param {recast.types.namedTypes.ObjectExpression} objectExpression 
     * @param {string} propName 
     */
    removeKeyFromObject(objectExpression, propName) {
        for (let i = objectExpression.properties.length - 1; i >= 0; i--) {
            let property = objectExpression.properties[i]
            if (property.type != "Property")
                continue
            let key = property.key
            if (key.type == "Identifier" && key.name == propName) {
                objectExpression.properties.splice(i, 1)
                break
            }
            if (key.type == "Literal" && key.value == propName) {
                objectExpression.properties.splice(i, 1)
                break
            }
        }
    }

    /**
     * 
     * @param {recast.types.namedTypes.ObjectExpression} objectExpression 
     */
    sortObjectProperties(objectExpression) {
        objectExpression.properties.sort((a, b) => {
            let keyNameA = undefined
            let keyNameB = undefined
            if (a.type != 'Property')
                return 0 // cannot sort this
            if (b.type != 'Property')
                return 0 // cannot sort this
            if (a.key.type == 'Identifier')
                keyNameA = a.key.name
            if (a.key.type == 'Literal')
                keyNameA = a.key.value
            if (b.key.type == 'Identifier')
                keyNameB = b.key.name
            if (b.key.type == 'Literal')
                keyNameB = b.key.value
            if (keyNameA == undefined || keyNameB == undefined)
                return 0 // no keys defined?
            if(keyNameA < keyNameB)
                return -1
            if(keyNameA > keyNameB)
                return 1
            return 0
        })
    }

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
}

export default ComponentModifier