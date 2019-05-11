import recast from 'recast'
import { isImportDeclaration } from '../node_modules/typescript/lib/typescript';
/*    
* Add / Remove new child template (and fix imports)
* Set position of child template
* Set props object of child template
* Set default props of own template
* Add / remove / change event handlers
*/

class ComponentModifier {

    constructor(code) {
        this.code = code
        this.ast = recast.parse(code)
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

        let children = this.getSetChildrenArgsAst()

        let newChildAst = recast.parse(`
            new ${childClassName}({
                position: {},
                props: {},
                eventHandlers: {},
            })`)

        const b = recast.types.builders
        let newArgProperty = b.property('init', b.identifier(childId), newChildAst.program.body[0].expression)
        children.properties.splice(children.properties.length, 0, newArgProperty)

        this.setChildPosition(childId, position)
    }

    /**
     * Remove a child with a given id
     * @param {string} childId 
     */
    removeChildComponent(childId) {
        let children = this.getSetChildrenArgsAst()

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
        let childArg = this.getChildConstructionArg(childId)

        // construct the position object ast
        const b = recast.types.builders
        let objProps = []
        for (let key in position) {
            objProps.push(b.property('init', b.identifier(key), b.literal(position[key])))
        }
        let objAst  = b.objectExpression(objProps)

        // replace the existing object with the new ast
        for (let prop of childArg.properties) {
            if (prop.key.name != 'position')
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
        let childArg = this.getChildConstructionArg(childId)

        let newEventhandlerAst = recast.parse(eventHandler).program.body[0].expression

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
        let childArg = this.getChildConstructionArg(childId)

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

    setOwnDefaultProps() {

    }

    // methods for internal use

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

        let newImportAst = recast.parse(importString).program.body[0]
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

    getConstructorBodyAst() {
        let classBody = this.getClassBodyAst()

        for (let statement of classBody) {
            if (statement.type != 'MethodDefinition')
                continue
            if (statement.key.type != 'Identifier' || statement.key.name != 'constructor')
                continue
            // bodyStatement is the constructor function

            return statement.value.body.body
        }
    }

    /**
     * @returns {ObjectExpression} containing the children passed to the setChildren function
     */
    getSetChildrenArgsAst() {
        let constructorBody = this.getConstructorBodyAst()

        for (let statement of constructorBody) {
            if (statement.type != 'ExpressionStatement')
                continue
            let expression = statement.expression
            if (expression.type != 'CallExpression')
                continue
            if (expression.callee.type != 'MemberExpression')
                continue
            if (expression.callee.property.type != 'Identifier')
                continue
            if (expression.callee.property.name != 'setChildren')
                continue

            // expression is the setChildren call
            let args = expression.arguments
            if (args.length == 0 || args[0].type != 'ObjectExpression')
                throw Error("Unexpected arguments on setChildren call")
            return args[0]
        }
    }

    /**
     * 
     * @param {string} childId Id of the child to get the arguments from
     * @returns {ObjectExpression} containing the different arguments (position, props and eventhandlers)
     */
    getChildConstructionArg(childId) {
        let children = this.getSetChildrenArgsAst()

        for (let prop of children.properties) {
            if (prop.key.name == childId)
                return prop.value.arguments[0]
        }
    }
}

export default ComponentModifier