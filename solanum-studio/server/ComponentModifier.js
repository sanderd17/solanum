import recast from 'recast'
import flow from 'flow-parser'

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

        let children = this.getClassField('children').value

        let newChildAst = recast.parse(`
            let _ = new ${childClassName}({
                parent: this,
                position: {},
                props: {},
                eventHandlers: {},
            })`, parseOptions)

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
        let children = this.getClassField('children').value
        this.removeKeyFromObject(children, childId)
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

    setChildProp(childId, propName, value) {
        if (!this.testValidPropName(propName)) {
            throw new Error(`Cannot add prop with name ${propName}. Only ASCII characters are allowed, starting with a letter and only containing letters, underscores and numbers`)
        }

        let childProps = this.getChildProps(childId)

        let foundProp = false
        for (let prop of childProps) {
            if (prop.key.name != propName && prop.key.value != propName)
                continue
            // prop is the wanted prop
            foundProp = true
            prop.value = valueToAst(value)
        }

        if (!foundProp) {
            let newProp = b.property('init', b.identifier(propName), valueToAst(value))
            childProps.splice(childProps.length, 0, newProp)
        }
    }

    removeChildProp(childId, propName) {
        let childProps = this.getChildProps(childId)

        for (let i = 0; i < childProps.length; i++) {
            let prop = childProps[i]
            if (prop.key.name != propName && prop.key.value != propName)
                continue
            // prop is the wanted prop
            childProps.splice(i, 1)
        }
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

            let newHandlerProperty = b.property('init', b.identifier(eventId), newEventhandlerAst)
            prop.value.properties.splice(prop.value.properties.length, 0, newHandlerProperty)
        }
    }

    removeChildEventHandler(childId, eventId) {
        let childArg = this.getChildDefinition(childId)

        let handlers = this.getObjectPropertyValueByName(childArg, "eventHandlers")
        if (handlers.type != 'ObjectExpression')
            throw new Error('eventHandlers parameter should be of type `ObjectExpression`')
        this.removeKeyFromObject(handlers, eventId)
    }

    /**
     * @param {string} propName 
     */
    testValidPropName(propName) {
        const validPropName = /^[a-zA-Z]+\w*$/
        return validPropName.test(propName)
    }

    addProp(propName, value) {
        if (!this.testValidPropName(propName)) {
            throw new Error(`Cannot add prop with name ${propName}. Only ASCII characters are allowed, starting with a letter and only containing letters, underscores and numbers`)
        }

        let propertiesAst = this.getClassField('properties').value
        let newPropertyAst = b.property('init',
            b.identifier(propName),
            b.newExpression(
                b.identifier("Prop"),
                [
                    b.literal(value)
                ]
            )
        )

        // TODO order keys alphabeticlly by default?
        propertiesAst.properties.splice(propertiesAst.properties.length, 0, newPropertyAst)
    }


    setProp(propName, value) {
        let propertiesAst = this.getClassField('properties').value
        let property = this.getObjectPropertyValueByName(propertiesAst, propName)
        if (!property)
            throw new Error(`Cannot find property ${propName}`)
        if (property.type != "NewExpression")
            throw new Error(`Property ${propName} is not a new object`)
        if (property.arguments.length != 1)
            throw new Error(`Property ${propName} requires 1 argument, ${property.arguments.length} given`)

        property.arguments[0] = b.literal(value)
    }

    removeProp(propName) {
        let propertiesAst = this.getClassField('properties').value
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
     * @param {recast.types.namedTypes.ObjectExpression} objectExpression 
     * @param {string} propName
     */
    getObjectPropertyValueByName(objectExpression, propName) {
        for (let property of objectExpression.properties) {
            if (property.type != "Property")
                continue
            let key = property.key
            if (key.type == "Identifier" && key.name == propName)
                return property.value
            if (key.type == "Literal" && key.value == propName)
                return property.value
        }
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
     * @returns {recast.types.namedTypes.ObjectExpression} containing the different arguments (position, props and eventhandlers)
     */
    getChildDefinition(childId) {
        let children = this.getClassField('children').value
        let childExpression = this.getObjectPropertyValueByName(children, childId)
        if (childExpression == undefined)
            return undefined
        
        if (childExpression.type != 'NewExpression')
            throw new Error(`Child with id ${childId} was not created as a new expression`)
        if (childExpression.arguments.length != 1)
            throw new Error(`Child with id ${childId} has no arguments`)
        let firstArg = childExpression.arguments[0]
        if (firstArg.type != "ObjectExpression")
            throw new Error(`Child with id ${childId} doesn't have an object as argument`)
        return firstArg
    }
    
    /**
     * @param {string} childId 
     */
    getChildProps(childId) {
        let childArg = this.getChildDefinition(childId)
        let propertiesAst = this.getObjectPropertyValueByName(childArg, "properties")
        if (propertiesAst == undefined)
            return undefined
        if (propertiesAst.type != "ObjectExpression")
            throw new Error(`Child with id ${childId} has no object as properties parameter`)
        return propertiesAst.properties
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
            return statement
        }
    }
}

export default ComponentModifier