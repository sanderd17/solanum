const assert = require('assert')

import ts from '../src/TagSet.js'

const TagSet = ts.constructor

let DummyTag = function(tagPath, otherArgs) {
    this.tagPath = tagPath
    this.otherArgs = otherArgs
    this.value = otherArgs.value
}

describe('TagSet', function() {
    describe('constructor', function() {
        it('should construct a tagset', function() {
            let ts = new TagSet()
            assert.equal(ts.activeSendTimer, 0)
            assert.equal(ts.changedTags.constructor, Set)
            assert.equal(ts.changedTags.size, 0)
            assert.equal(ts.tags.constructor, Map)
            assert.equal(ts.tags.size, 0)
        })
    }),
    describe('addTag', function() {
        it('should instantiate a tag', function() {
            let ts = new TagSet()
            ts.addTag('testTp', {type: DummyTag, arg: 'testArg'})

            assert.equal(ts.tags.size, 1)
            let t = ts.tags.get('testTp')
            assert.equal(t.constructor, DummyTag)
            assert.equal(t.tagPath, 'testTp')
            assert.equal(t.otherArgs.arg, 'testArg')
        })
    }),
    describe('setTags', function() {

        it('should add all tags', function() {
            let ts = new TagSet()
            let testObj = {'descr': 'described'}
            ts.addTag = function(tagpath, tagDescr) {
                assert.equal(tagpath, 'testTp')
                assert.equal(tagDescr, testObj)
            }

            ts.setTags({'testTp': testObj})
        })
    }),
    describe('triggerChange', function() {
        it('should queue changed tags', function() {
            let ts = new TagSet()

            ts.triggerChange({tagPath: 'testTp1', value: 'newValue1'})
            assert.notEqual(ts.activeSendTimer, 0)
            let timerId = ts.activeSendTimer
            assert.equal(ts.changedTags.size, 1)
            // Make sure only one notification is send for 2 changes in the same event loop
            ts.triggerChange({tagPath: 'testTp2', value: 'newValue2'})
            assert.equal(ts.changedTags.size, 2)
            assert.equal(ts.activeSendTimer, timerId)
            // clean up timer
            clearTimeout(timerId)
        })
    }),
    describe('sendChangedTags', function() {
        it('should notify a list of clients', function() {
            let ts = new TagSet()

            ts.changedTags.add({tagPath: 'testTp1', value: 'newValue1'})
            ts.changedTags.add({tagPath: 'testTp2', value: 'newValue2'})
            let called = 0

            let dummyClientList = new Set([
                {sendTags: (tagsToSend) => {
                    assert.equal(tagsToSend.testTp1.value, 'newValue1')
                    assert.equal(tagsToSend.testTp2.value, 'newValue2')
                    called++
                }},
                {sendTags: (tagsToSend) => {
                    assert.equal(tagsToSend.testTp1.value, 'newValue1')
                    assert.equal(tagsToSend.testTp2.value, 'newValue2')
                    called++
                }}
            ])

            ts.sendChangedTags(dummyClientList)
            assert.equal(called, 2)
            assert.equal(ts.changedTags.size, 0)
        })
    })
})
