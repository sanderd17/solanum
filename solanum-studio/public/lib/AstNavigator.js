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
        return key.value
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
 * @param {File} ast 
 */
export function getClassAst(ast) {
    const astBody = ast.program.body
    for (let statement of astBody) {
        if (statement.type != 'ClassDeclaration')
            continue

        return statement.body
    }
}

/**
 * Get a class field
 * @param {File} ast
 * @param {string} fieldName 
 * @returns {ClassProperty?} class field with give name
 */
export function getClassField(ast, fieldName) {
    let classAst = getClassAst(ast);

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