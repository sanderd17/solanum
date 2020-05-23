import assert from 'assert'
import jsdom from 'jsdom'
const JSDOM = jsdom.JSDOM

import Prop from '/lib/ComponentProp.js'
/** @typedef { import('/lib/ComponentProp').default } Prop */

export default function({describe, it, beforeEach}) {
    let ctx = {} // create default context
    beforeEach(() => {
        ctx = {properties: {}}
        const d = new JSDOM('', {
            url: 'http://solanum.org/',
        })
        global.document = d.window.document
        global.window = d.window
        window.IntersectionObserver = function() {}
        window.IntersectionObserver.prototype.observe = function() {}
    })
    describe('Basic props', () => {
        it('Evaluates a number', () => {
            let p = new Prop(123)
            p.setContext(ctx)
            assert.equal(p.value, 123)
            assert.equal(p.bindingFunction, undefined)
        })
        it('Evaluates a string', () => {
            let p = new Prop('test')
            p.setContext({})
            assert.equal(p.value, "test")
            assert.equal(p.bindingFunction, undefined)
        })
    })
    describe('Static function props', () => {
        it('Evaluates a mathematical expression', () => {
            let p = new Prop(0)
            p.setBinding('2+3')
            p.setContext(ctx)
            assert.equal(p.value, 5)
            assert.equal(typeof p.bindingFunction, "function")
        })
    })
    describe('Tag props', () => {
        it('Can subscribe to a tag', () => {
            let numCalls = 0
            let ts = {
                addPropSubscription: (prop, tagPath) => {
                    numCalls += 1
                    assert.equal(tagPath, 'myTagPath')
                },
                getCachedTagValue: (tagPath) => {
                    return undefined
                }
            }
            let p = new Prop(0, null, ts)
            p.setBinding("Tag('myTagPath', 0)")
            p.setContext(ctx)
            assert.equal(p.value, 0)
            assert.equal(numCalls, 1)
            assert(p.subscribedTags.has('myTagPath'))

            // the tag value has been updated
            p.ts.getCachedTagValue = (tagPath) => 123
            p.recalcValue()
            assert.equal(p.value, 123)
            assert.equal(numCalls, 2)
        })
        it('Can remove a tag subscription', () => {
            let numCalls = 0
            let ts = {
                addPropSubscription: (prop, tagPath) => {},
                getCachedTagValue: (tagPath) => {
                    return undefined
                },
            }
            let p = new Prop(0, null, ts)
            p.setBinding("Tag('myTagPath')")
            p.setContext(ctx)
            assert(p.subscribedTags.has('myTagPath'))

            ts.removePropSubscription = (prop, tagPath) => {
                assert.equal(prop, p)
                assert.equal(tagPath, 'myTagPath')
                numCalls++
            }

            p.setBinding('123')
            p.recalcValue()
            assert.equal(p.value, 123)
            assert.equal(numCalls, 1)
            assert(!p.subscribedTags.has('myTagPath'))
        })
    })
    describe('Bound props', () => {
        it('Has access to the component props', () => {
            let p = new Prop(0)
            p.setBinding("Prop('a')")
            ctx.properties.a = {value: 123}
            p.setContext(ctx)
            assert.equal(p.value, 123)
            assert(p.subscribedProps.has('a'))
        })
    })
    describe('Invalid props', () => {
        it("Throws an error on unaccessible variable name", () => {
            assert.throws(() => {
                let p = new Prop("")
                p.setBinding("unaccessibleVariableName")
                p.setContext(ctx)
            })
        })
        it('Throws an error on a syntax fault', () => {
            assert.throws(() => {
                let p = new Prop("")
                p.setBinding("(")
                p.setContext(ctx)
            })
        })
    })
    describe('value setter', () => {
        it('Sets an int value to an int prop', () => {
            let p = new Prop(123)
            p.setContext(ctx)
            p.value = 456
            assert.equal(p.value, 456)
        })
        it('Can change data type', () => {
            let p = new Prop('test')
            p.setContext(ctx)
            p.value = 456
            assert.equal(p.value, 456)
        })
        it("Doesn't change the value of a recalc", () => {
            let p = new Prop("test")
            p.setContext(ctx)
            p.value = 456
            p.recalcValue()
            assert.equal(p.value, 456)
        })
    })
    describe('Change listener', () => {
        it('Allows to register two callbacks', () => {
            let p = new Prop(123)
            let cb1Called = false
            let cb2Called = false
            let cb1 = () => {cb1Called = true}
            let cb2 = () => {cb2Called = true}
            p.addChangeListener(cb1)
            p.addChangeListener(cb2)
            assert(p.changeListeners.has(cb1))
            assert(p.changeListeners.has(cb2))
            p.setContext(ctx)
            p.value = 456
            assert.equal(cb1Called, true)
            assert.equal(cb2Called, true)
        })
        it('Can remove callbacks', () => {
            let p = new Prop(123)
            let cbCalled = false
            let cb = () => {cbCalled = true}
            p.addChangeListener(cb)
            assert(p.changeListeners.has(cb))
            p.removeChangeListener(cb)
            assert(!p.changeListeners.has(cb))
            p.setContext(ctx)
            assert.equal(cbCalled, false)
        })
        it('Acts on setting value', () => {
            let p = new Prop(123)
            let numCalls = 0
            let cb = () => {numCalls++}
            p.addChangeListener(cb)
            p.setContext(ctx)

            p.value = 456
            assert.equal(numCalls, 1)
        })
        it('Acts on real recalc updates', () => {
            let p = new Prop("")
            p.setBinding("Prop('a')")
            let numCalls = 0
            let cb = () => {numCalls++}
            p.addChangeListener(cb)
            ctx.properties.a = {value: 123}
            p.setContext(ctx)

            p.recalcValue() // value didn't change, call didn't happen
            assert.equal(numCalls, 1)

            ctx.properties.a = {value: 456}
            p.recalcValue()
            assert.equal(numCalls, 2)
        })
    })
}