import assert from 'assert'

import TagSet from '../../solanum-core/server/TagSet.js'
import Tag from '../../solanum-core/server/Tag.js'
import MemoryTag from '../../solanum-core/server/MemoryTag.js'
import clientList from '../../solanum-core/server/ClientList.js'


class DummyTag extends Tag {

    constructor(data) {
        super(data)
        this.otherArgs = data
    }

    write(value) {
        this.value = value
    }
}


export default function({describe, it}) {
    describe('constructor', function() {
        it('should construct a tagset', function() {
            let ts = new TagSet(null, null)
            assert.equal(ts.activeSendTimer, null)
            assert.equal(ts.changedTags.constructor, Set)
            assert.equal(ts.changedTags.size, 0)
        })
    }),
    describe('setTags', function() {
        it('should add all tags', async () => {
            let ts = new TagSet(null, null)
            let testObj = {'descr': 'described', 'type': DummyTag}
            await ts.setTags('root', {'testTp': testObj})
            let tag = ts.getTag('root.testTp')
            assert(tag instanceof DummyTag)
            assert.equal(tag.tagpath.join('.'), 'root.testTp')
        })
    }),
    describe('triggerChange', function() {
        it('should queue changed tags', function() {
            let ts = new TagSet(null, null)

            ts.triggerChange({tagpath: ['testTp1'], value: 'newValue1'})
            assert.notEqual(ts.activeSendTimer, null)
            let timerId = ts.activeSendTimer
            assert.equal(ts.changedTags.size, 1)
            // Make sure only one notification is send for 2 changes in the same event loop
            ts.triggerChange({tagpath: ['testTp2'], value: 'newValue2'})
            assert.equal(ts.changedTags.size, 2)
            assert.equal(ts.activeSendTimer, timerId)
            // @ts-ignore
            // clean up timer
            clearInterval(timerId)
        })
    }),
    describe('sendChangedTags', function() {
        it('should notify a list of clients', async () => {
            let ts = new TagSet(null, null)

            await ts.root.addTag(['testTp1'], {type: MemoryTag, arg: 'testArg'})
            await ts.root.addTag(['testTp2'], {type: MemoryTag, arg: 'testArg'})

            ts.getTag('testTp1').write('newValue1')
            ts.getTag('testTp2').write('newValue2')
            let called = 0

            clientList.add(
                {sendMessage: (msg) => {
                    console.log(msg)
                    assert.equal(msg['TagSet:updateTags'].testTp1.value, 'newValue1')
                    assert.equal(msg['TagSet:updateTags'].testTp2.value, 'newValue2')
                    called++
                }}
            )
            clientList.add(
               {sendMessage: (msg) => {
                    assert.equal(msg['TagSet:updateTags'].testTp1.value, 'newValue1')
                    assert.equal(msg['TagSet:updateTags'].testTp2.value, 'newValue2')
                    called++
                }}
            )
            ts.sendChangedTags()
            assert.equal(called, 2)
            assert.equal(ts.changedTags.size, 0)
            clientList.clear()
        })
    })
}
