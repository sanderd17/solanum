/**
 * Exposes static functions to navigate the AST of a component
 * 
 * Type imports for autocomplete
 * @typedef { import('recast').types.namedTypes.ClassProperty} ClassProperty 
 * @typedef { import('recast').types.namedTypes.File} File 
 * @typedef { import('recast').types.namedTypes.ObjectExpression} ObjectExpression 
 * @typedef { import('recast').types.namedTypes.Property} Property 
*/

/**
 * 
 * @param {Property} objectProperty 
 */
export function getPropertyKeyName(objectProperty) {
    let key = objectProperty.key
    if (key.type == "Identifier")
        return key.name
    if (key.type == "Literal")
        return key.value.toString()
}

/**
 * @param {ObjectExpression} objectExpression 
 * @param {string} propName
 */
export function getObjectPropertyByName(objectExpression, propName) {
    for (let property of objectExpression.properties) {
        if (property.type != "Property")
            continue
        if (getPropertyKeyName(property) == propName)
            return property
    }
}

/**
 * Get the 
 * @param {File} ast 
 */
export function getDefaultExportDefinition(ast) {
    const astBody = ast.program.body
    let objects = []
    let exportStatement
    for (let statement of astBody) {
        // Find variableDeclaration wit ObjectExpression as init
        if (statement.type == 'ExportDefaultDeclaration') {
            exportStatement = statement
        }
    }
    if (!exportStatement)
        throw new Error(`No default export found`)
    if (exportStatement.declaration.type == 'AssignmentExpression') {
        return exportStatement.declaration.right
    }
    if (exportStatement.declaration.type == 'Identifier') {
        // TODO find initialisation of identifier
    }
    throw new Error(`Cannot yet find value of export declaration of type ${exportStatement.declaration.type}`)
}

/**
 * Returns the classes found at the root of the AST
 * @param {File} ast 
 */
export function getClassesAst(ast) {
    const astBody = ast.program.body
    let classes = []
    for (let statement of astBody) {
        if (statement.type == 'ClassDeclaration') {
            classes.push(statement.body)
        }
    }
    return classes
}

/**
 * Get a class field
 * @param {File} ast
 * @param {string} fieldName 
 * @returns {ClassProperty?} class field with give name
 */
export function getClassField(ast, fieldName) {
    let classesAst = getClassesAst(ast);
    if (classesAst.length != 1) {
        throw new Error(`${classesAst.length} classes found, only one expected`)
    }
    let classAst = classesAst[0]

    for (let statement of classAst.body) {
        if (statement.type != 'ClassProperty')
            continue
        if (!statement.key || statement.key.type != 'Identifier')
            continue
        if (statement.key.name != fieldName)
            continue
        return statement
    }
    return undefined
}

/**
 * @param {File} ast 
 * @returns {Property[]}
 */
export function getOwnPropertiesAst(ast) {
    let propertiesAst = getClassField(ast, 'properties')
    if (!propertiesAst)
        return undefined
    if (propertiesAst.value.type != 'ObjectExpression')
        throw new Error('The properties field is not configured as an object')

    let propertiesList = []
    for (let p of propertiesAst.value.properties) {
        if (p.type == 'SpreadProperty')
            continue
        if (p.type == "Property")
            propertiesList.push(p)
        else
            throw new Error("Properties field has elements that aren't of type Property")
    }

    return propertiesList
}

/**
 * @param {File} ast
 * @param {string} childId Id of the child to get the arguments from
 * @returns {Property} The complete child definition as an object property
 */
export function getChildAst(ast,childId) {
    let children = getClassField(ast, 'children').value
    if (children == undefined)
        return undefined

    if (children.type != "ObjectExpression")
        throw new Error(`Children of edited class are not defined as an object property`)

    return getObjectPropertyByName(children, childId)
}
/**
 * @param {File} ast
 * @param {string} childId Id of the child to get the arguments from
 * @returns {ObjectExpression} containing the different arguments (position, props and eventhandlers)
 */
export function getChildDefinition(ast, childId) {
    let childProperty = getChildAst(ast, childId)
    if (childProperty == undefined)
        return undefined
        
    let childExpression = childProperty.value
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
 * @param {File} ast
 * @param {string} childId 
 */
export function getChildProps(ast, childId) {
    let childArg = getChildDefinition(ast, childId)
    let propertiesAst = getObjectPropertyByName(childArg, "properties")
    if (propertiesAst == undefined)
        return undefined
    if (propertiesAst.value.type != "ObjectExpression")
        throw new Error(`Child with id ${childId} has no object as properties parameter`)
    return propertiesAst.value
}

/**
 * Sort keys of the object alphabetically
 * @param {import('recast').types.namedTypes.ObjectExpression} objectExpression 
 */
export function sortObjectProperties(objectExpression) {
    const getKeyName = (key) => {
        if (key.type == 'Identifier')
            return key.name
        if (key.type == 'Literal')
            return key.value
    }

    objectExpression.properties.sort((a, b) => {
        if (a.type != 'Property')
            return 0 // cannot sort this
        if (b.type != 'Property')
            return 0 // cannot sort this

        let keyNameA = getKeyName(a.key)
        let keyNameB = getKeyName(b.key)
        
        if(keyNameA < keyNameB)
            return -1
        if(keyNameA > keyNameB)
            return 1
        return 0
    })
}

/**
 * Convert a JS value into printable AST.
 * Supports only JSON compatible types: number, string, Object and Array
 * @param {number|string|Object|Array} val 
 * @param {import('recast').types.builders} b 
 * @return {import('recast').types.namedTypes.ObjectExpression | import('recast').types.namedTypes.ArrayExpression | import('recast').types.namedTypes.Literal}
 */
export function valueToAst(val, b) {
    if (typeof val == "number" || typeof val == "string") {
        return b.literal(val)
    }
    if (val instanceof Array) {
        let elements = val.map((el) => valueToAst(el, b))
        return b.arrayExpression(elements)
    }
    // val is Object
    let properties = []
    for (let [key, value] of Object.entries(val)) {
        let keyAst
        if (/^[a-zA-Z_]\w*$/.test(key)) {
            keyAst = b.identifier(key)
        } else {
            keyAst = b.literal(key)
        }
        properties.push(b.property('init', keyAst, valueToAst(value, b)))
    }
    return b.objectExpression(properties)
}