import recast from 'recast'
import flow from 'flow-parser'

import {getDefaultExportDefinition, getObjectPropertyByName, getClassField, getOwnPropertiesAst, getChildDefinition, getChildProps, valueToAst, sortObjectProperties} from '../public/lib/AstNavigator.js'

const parseOptions = {
    'parser': {
        parse: c => flow.parse(c, {
            esproposal_class_instance_fields: true,
            esproposal_class_static_fields: true,
        }), // Flow parser supports class fields https://github.com/tc39/proposal-class-fields
    }
}

const b = recast.types.builders

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
     * @param {recast.types.namedTypes.ObjectExpression?} directoryAst Starting directory
     * @param {boolean} [createWhenNotFound]
     */
    getTagAst(tagpath, directoryAst, createWhenNotFound) {
        if (typeof tagpath == "string") {
            tagpath = tagpath.split('.')
        }
        if (tagpath.length == 0) {
            return directoryAst // no subtag needed, return itself
        }
        tagpath = [...tagpath] // clone to avoid changes to the original element

        let firstPath = tagpath.shift()
        let subdirectoryAst = getObjectPropertyByName(directoryAst, firstPath)?.value
        // find or create the subdirectory
        if (subdirectoryAst == null) {
            if (createWhenNotFound) {
                let newProperty = b.property('init', b.identifier(firstPath), b.objectExpression([]))
                directoryAst.properties.splice(0, 0, newProperty)
                subdirectoryAst = newProperty.value
                sortObjectProperties(directoryAst)
            } else {
                throw new Error(`Directory with the name ${firstPath} not found`)
            }
        }

        if (subdirectoryAst.type != 'ObjectExpression') {
            throw new Error(`Found tag with unknown type ${subdirectoryAst.type}`)
        }
        return this.getTagAst(tagpath, subdirectoryAst, createWhenNotFound)
    }

    /**
     * @param {string|string[]} tagpath 
     * @param {string} tagtype
     * @param {Object} description 
     */
    addTag(tagpath, tagtype, description) {
        if (typeof tagpath == "string") {
            tagpath = tagpath.split('.')
        }
        let tagname = tagpath.pop() // last part of the tagpath is the tag name
        let directoryAst = this.getTagAst(tagpath, this.tagsObject, true) // get directory based on the rest of the tagpath

        let existingTag = getObjectPropertyByName(directoryAst, tagname)
        if (existingTag != undefined) 
            throw new Error(`There is already a tag defined with tagpath ${tagpath}`)

        let newTagDefinition = valueToAst(description, b)
        if (newTagDefinition.type != "ObjectExpression") {
            throw new Error(`addTag receifec a description of type ${newTagDefinition.type} while an object was expected`)
        }
        let typeProperty = b.property('init', b.identifier('type'), b.identifier(tagtype))
        newTagDefinition.properties.splice(0, 0, typeProperty)

        let tagProperty = b.property('init', b.identifier(tagname), newTagDefinition)
        directoryAst.properties.splice(0,0,tagProperty)
        sortObjectProperties(directoryAst)
    }

    /**
     * @param {string|string[]} tagpath 
     * @param {string} parameterName 
     * @param {*} parameterValue 
     */
    setTagParameter(tagpath, parameterName, parameterValue) {
        if (typeof tagpath == "string") {
            tagpath = tagpath.split('.')
        }

        let tagAst = this.getTagAst(tagpath, this.tagsObject)

        let parameterAst = getObjectPropertyByName(tagAst, parameterName)
        if (parameterAst == null) {
            parameterAst = b.property('init', b.identifier(parameterName), valueToAst(parameterValue, b))
            tagAst.properties.splice(0, 0, parameterAst)
            sortObjectProperties(tagAst)
        } else {
            parameterAst.value = valueToAst(parameterValue, b)
        }
    }
}

export default TagModifier