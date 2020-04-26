import assert from 'assert'

import recast from 'recast'
import flow from 'flow-parser'
import TagModifier from '../../solanum-studio/server/TagModifier.js'

assert.includes = (str, subStr) => assert(str.includes(subStr), `"${subStr}" was not found inside
${str}`)


const parseOptions = {
    'parser': {
        parse: c => flow.parse(c, {
            esproposal_class_instance_fields: true,
            esproposal_class_static_fields: true,
        }), // Flow parser supports class fields https://github.com/tc39/proposal-class-fields
    }
}

const initialCode = `
import tagtypes from 'solanum-core/server/TagTypes.js'

const {MemoryTag} = tagtypes

export default tags = {
    'memTag1': {
        type: MemoryTag,
        defaultValue: 0,
    },
    memTag2: {
            type: MemoryTag,
            defaultValue: 10
    },
    tagDirectory: {
        'memTagNested': {
            type: MemoryTag,
            defaultValue: 255
        }
    }
}
`

export default function({describe, it}) {
    describe('constructor', () => {
        it('Parses the code to create an AST object', () => {
            let tagModifier = new TagModifier(initialCode)
            assert.equal(tagModifier.code, initialCode)
            assert(tagModifier.ast != null)
        })
        it('Searches for the default exported object', () => {
            let tagModifier = new TagModifier(initialCode)
            assert.equal(tagModifier.tagsObject.type, 'ObjectExpression')
        })
        it.skip('Should throw an error on invalid JS', () => {
            
        })
    })
    describe('addTag', () => {
        it('Adds a tag to the root directory', () => {
            let tagModifier = new TagModifier(initialCode)
            tagModifier.addTag('memTag3', 'NewTagType', {
                'defaultValue': 4
            })
            let newCode = tagModifier.print()
            assert.includes(newCode, 'type: NewTagType')
            assert.includes(newCode, 'memTag3: {')
            assert.includes(newCode, 'defaultValue: 4')
        })
        it.skip('Adds a tag to the active tags', () => {
            let tagModifier = new TagModifier(initialCode)
            tagModifier.addTag('memTag3', 'MemoryTag', {
                'defaultValue': 4
            })
            assert.fail("should test the tagset")
        })
        it('Adds a tag to a list subdirectory', () => {
            let tagModifier = new TagModifier(initialCode)
            tagModifier.addTag(['tagDirectory', 'memTag3'], 'NewTagType', {
                'defaultValue': 4
            })
            let newCode = tagModifier.print()
            assert.includes(newCode, 'type: NewTagType')
            assert.includes(newCode, 'tagDirectory: {')
            assert.includes(newCode, 'memTag3: {')
            assert.includes(newCode, 'defaultValue: 4')
        })
        it('Adds a tag to a dotted subdirectory', () => {
            let tagModifier = new TagModifier(initialCode)
            tagModifier.addTag('tagDirectory.memTag3', 'NewTagType', {
                'defaultValue': 4
            })
            let newCode = tagModifier.print()
            assert.includes(newCode,'type: NewTagType')
            assert.includes(newCode, 'tagDirectory: {')
            assert.includes(newCode, 'memTag3: {')
            assert.includes(newCode, 'defaultValue: 4')
        })
        it('Creates a dotted subdirectory', () => {
            let tagModifier = new TagModifier(initialCode)
            tagModifier.addTag('tagDirectory2.memTag3', 'NewTagType', {
                'defaultValue': 4
            })
            let newCode = tagModifier.print()
            assert.includes(newCode, 'type: NewTagType')
            assert.includes(newCode, 'tagDirectory2: {')
            assert.includes(newCode, 'memTag3: {')
            assert.includes(newCode, 'defaultValue: 4')
        })
        it.skip('Should add a new import when needed', () => {

        })
    })
    describe('deleteTag', () => {
        it.skip('Should be tested')
    })
    describe('alterTag', () => {
        it.skip('Should be tested')
    })
    describe('bulkAddTags', () => {
        it.skip('Should parse the code once, and add multiple tags', () => {

        })
    })
    describe('bulkDeleteTags', () => {
        it.skip('Should be tested')
    })
    describe('bulkAlterTags', () => {
        it.skip('Should be tested')
    })
}
