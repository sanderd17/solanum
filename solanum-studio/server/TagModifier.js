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
     * @param {string} tagname
     * @param {recast.types.namedTypes.ObjectExpression?} directoryAst Directory that should contain the tag
     * @return {recast.types.namedTypes.NewExpression} The folder object or new tag construction
     */
    getTagAst(tagname, directoryAst) {

        let tagAst = getObjectPropertyByName(directoryAst, tagname)?.value
        // find or create the subdirectory
        if (tagAst == null) {
            return null
        }

        if (tagAst.type != 'NewExpression') {
            throw new Error(`Found tag with unknown type ${tagAst.type}`)
        }
        return tagAst
    }

    /**
     * @param {string} tagname
     * @param {recast.types.namedTypes.ObjectExpression?} directoryAst Directory that should contain the tag
     * @return {recast.types.namedTypes.ObjectExpression} The folder object or new tag construction argument object
     */
    getTagParameterAst(tagname, directoryAst) {
        let tagAst = this.getTagAst(tagname, directoryAst)
        
        if (tagAst.arguments.length != 1){
            throw new Error(`Found ${tagAst.arguments.length} parameters; exactly 1 expected`)
        }

        let argAst = tagAst.arguments[0]
        if (argAst.type != 'ObjectExpression') {
            throw new Error(`Tag constructor argument should be an object, found ${tagAst.type} instead`)
        }
        return argAst
    }

    /**
     * Recursively create a tag folder under the given directory
     * @param {string[]} tagpath 
     * @param {recast.types.namedTypes.ObjectExpression} directoryAst 
     * @return {recast.types.namedTypes.ObjectExpression} the created directory
     */
    getTagDirectory(tagpath, directoryAst) {
        if (tagpath.length == 0) {
            return directoryAst
        }
        tagpath = [...tagpath] // clone to avoid changes to the original element

        let firstPath = tagpath.shift()
        let subTagAst = getObjectPropertyByName(directoryAst, firstPath)?.value
        // find or create the subdirectory
        if (subTagAst == null) {
            let newProperty = b.property('init', b.identifier(firstPath), b.objectExpression([]))
            directoryAst.properties.splice(0, 0, newProperty)
            subTagAst = newProperty.value
            sortObjectProperties(directoryAst)
        }
        if (subTagAst.type != 'ObjectExpression') {
            throw new Error(`Found tag with unknown type ${subTagAst.type}`)
        }
        return this.getTagDirectory(tagpath, subTagAst)
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
        let directoryAst = this.getTagDirectory(tagpath, this.tagsObject)

        let existingTag = getObjectPropertyByName(directoryAst, tagname)
        if (existingTag != undefined) 
            throw new Error(`There is already a tag defined with tagpath ${tagpath}`)

        let newTagParameters = valueToAst(description, b)
        if (newTagParameters.type != "ObjectExpression") {
            throw new Error(`addTag receifec a description of type ${newTagParameters.type} while an object was expected`)
        }
        let tagConstruction = b.newExpression(b.identifier(tagtype), [newTagParameters])

        let tagProperty = b.property('init', b.identifier(tagname), tagConstruction)
        directoryAst.properties.splice(0,0,tagProperty)
        sortObjectProperties(directoryAst)
    }

    /**
     * @param {string|string[]} tagpath 
     */
    deleteTag(tagpath) {
        if (typeof tagpath == "string") {
            tagpath = tagpath.split('.')
        }
        let tagname = tagpath.pop() // last part of the tagpath is the tag name
        let directoryAst = this.getTagDirectory(tagpath, this.tagsObject) // get directory based on the rest of the tagpath

        for (let i = 0; i < directoryAst.properties.length; i++) {
            let p = directoryAst.properties[i]
            if (p.type != "Property") {
                continue
            }
            let keyName
            if (p.key.type == 'Identifier') {
                keyName = p.key.name
            } else if (p.key.type == "Literal") {
                keyName = p.key.value
            } else {
                throw new Error("Uknown key type: " + p.key.type)
            }
            if (keyName == tagname) {
                // tag found, delete the tag
                directoryAst.properties.splice(i, 1)
                return
            }
        }
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

        let tagname = tagpath.pop()
        let tagDirectory = this.getTagDirectory(tagpath, this.tagsObject)
        let tagAst = this.getTagParameterAst(tagname, tagDirectory)

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