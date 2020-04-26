import recast from 'recast'
import flow from 'flow-parser'

import {getDefaultExportDefinition, getObjectPropertyByName, getClassField, getOwnPropertiesAst, getChildDefinition, getChildProps, objectToAst, sortObjectProperties} from '../public/lib/AstNavigator.js'

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
 * Class to allow modifications to tag files.
 * This is based on a fixed structure of the tags
 * and uses AST parsing to maintain formatting and functionality of
 * the existing code.
 */
class TagModifier {

    /** @type {import('recast').types.namedTypes.ObjectExpression} */
    tagsObject

    /**
     * Parse the complete module code to AST, ready for modifications
     * @param {string} code 
     */
    constructor(code) {
        this.code = code
        /** @type {recast.types.namedTypes.File} */
        this.ast = recast.parse(code, parseOptions)

        let tagsObject = getDefaultExportDefinition(this.ast)
        if (tagsObject.type == "ObjectExpression") {
            this.tagsObject = tagsObject
        } else {
            throw new Error(`Cannot parse tags object of type ${this.tagsObject.type}`)
        }
    }

    /**
     * @returns {string} new module code
     */
    print() {
        return recast.print(this.ast).code
    }

    /**
     * @param {string|string[]} tagpath 
     * @param {string} tagtype
     * @param {Object} description 
     * @param {recast.types.namedTypes.ObjectExpression?} [tagsObject]
     */
    addTag(tagpath, tagtype, description, tagsObject) {
        if (typeof tagpath == "string") {
            tagpath = tagpath.split('.')
        }
        if (tagsObject == null) {
            tagsObject = this.tagsObject
        }

        let firstPath = tagpath.shift()
        let existingTag = getObjectPropertyByName(tagsObject, firstPath)

        if (tagpath.length > 0) {
            if (existingTag.value.type != 'ObjectExpression') {
                throw new Error(`Found tag with unknown type ${existingTag.value.type}`)
            }
            this.addTag(tagpath, tagtype, description, existingTag.value)
            return
        }

        if (existingTag != undefined) 
            throw new Error(`There is already a tag defined with tagpath ${tagpath}`)

        let newTagDefinition = objectToAst(description, b)
        let typeProperty = b.property('init', b.identifier('type'), b.identifier(tagtype))
        newTagDefinition.properties.splice(0, 0, typeProperty)

        let tagProperty = b.property('init', b.identifier(firstPath), newTagDefinition)
        this.tagsObject.properties.splice(0,0,tagProperty)
        sortObjectProperties(tagsObject)
    }
}

export default TagModifier