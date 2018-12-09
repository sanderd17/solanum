// @ts-nocheck
const assert = require('assert')

import {TagSet} from '../src/TagSet.js'


let DummyTag = function(tagPath, otherArgs) {
    this.tagPath = tagPath
    this.otherArgs = otherArgs
    this.value = otherArgs.value
}

describe('TagSet', function() {
    describe('constructor', function() {
        it('should construct a tagset', function() {
            let ts = new TagSet()
            assert.equal(ts.activeSendTimer, null)
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
            assert.notEqual(ts.activeSendTimer, null)
            let timerId = ts.activeSendTimer
            assert.equal(ts.changedTags.size, 1)
            // Make sure only one notification is send for 2 changes in the same event loop
            ts.triggerChange({tagPath: 'testTp2', value: 'newValue2'})
            assert.equal(ts.changedTags.size, 2)
            assert.equal(ts.activeSendTimer, timerId)
            // @ts-ignore
            // clean up timer
            clearInterval(timerId)
        })
    }),
    describe('sendTags', function() {
        it('should notify a list of clients', function() {
            let ts = new TagSet()

            ts.tags.set('testTp1', {value: 'newValue1'})
            ts.tags.set('testTp2', {value: 'newValue2'})
            ts.changedTags.add('testTp1')
            ts.changedTags.add('testTp2')
            let called = 0

            let dummyClientList = new Set([
                {sendMessage: (msg) => {
                    assert.equal(msg['TagSet:updateTags'].testTp1.value, 'newValue1')
                    assert.equal(msg['TagSet:updateTags'].testTp2.value, 'newValue2')
                    called++
                }},
                {sendMessage: (msg) => {
                    assert.equal(msg['TagSet:updateTags'].testTp1.value, 'newValue1')
                    assert.equal(msg['TagSet:updateTags'].testTp2.value, 'newValue2')
                    called++
                }}
            ])

            ts.sendTags(dummyClientList)
            assert.equal(called, 2)
            assert.equal(ts.changedTags.size, 0)
        })
    })
})
