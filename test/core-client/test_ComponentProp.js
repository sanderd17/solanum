import assert from 'assert'
import jsdom from 'jsdom'
const JSDOM = jsdom.JSDOM

import Prop from '/lib/ComponentProp.js'
/** @typedef { import('/lib/ComponentProp').default } Prop */

export default function({describe, it, beforeEach}) {
    describe('constructor', function() {
        it('Evaluates a number string', () => {
            let p = new Prop("123")
            assert.equal(typeof p.bindingFunction, "function")
        })
        it('Evaluates a string string', () => {
            let p = new Prop("'test'")
            assert.equal(typeof p.bindingFunction, "function")
        })
        it('Evaluates a mathematical expression', () => {
            let p = new Prop("2 + 3")
            assert.equal(typeof p.bindingFunction, "function")
        })
        it("Throws an error on unaccessible variable name", () => {
            assert.throws(() => {let p = new Prop("unaccessibleVariableName")})
        })
        it('Throws an error on a syntax fault', () => {
            assert.throws(() => {let p = new Prop("(")})
        })
    })
    describe('recalcValue', function() {
        it('Returns a number string as number', () => {
            let p = new Prop("123")
            assert.equal(p.value, 123)
        })
        it('Returns a string string as string', () => {
            let p = new Prop("'test'")
            assert.equal(p.value, "test")
        })
        it('Calculates a mathematical expression', () => {
            let p = new Prop("2 + 3")
            assert.equal(p.value, 5)
        })
        it('Has access to the component props', () => {
            let p = new Prop("Prop('a')")
            assert.equal(p.value, undefined)

            p.recalcValue({properties:{a: {value: 123}}})
            assert.equal(p.value, 123)
            assert(p.subscribedProps.has('a'))
        })
        it('Stores and reuses the dependencyCmp', () => {
            let p = new Prop("Prop('a')")
            assert.equal(p.value, undefined)
            let dependency = {properties:{a: {value: 123}}}
            p.recalcValue(dependency)
            assert.equal(p.value, 123)
            assert.equal(p.dependencyCmp, dependency)

            p.recalcValue()
            assert.equal(p.value, 123)
            assert.equal(p.dependencyCmp, dependency)

            let dependency2 = {properties:{a: {value: 456}}}
            p.recalcValue(dependency2)
            assert.equal(p.value, 456)
            assert.equal(p.dependencyCmp, dependency2)
        })
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
            let p = new Prop("Tag('myTagPath', 0)", ts)
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
            let p = new Prop("Tag('myTagPath')", ts)
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
    describe('value setter', function() {
        it('Sets an int value to an int prop', function() {
            let p = new Prop("123")
            p.recalcValue({})
            p.value = 456
            assert.equal(p.value, 456)
        })
        it('Can change data type', function() {
            let p = new Prop("'test'")
            p.recalcValue({})
            p.value = 456
            assert.equal(p.value, 456)
        })
        it("Doesn't change the value of a recalc", () => {
            let p = new Prop("'test'")
            p.recalcValue({})
            p.value = 456
            p.recalcValue({})
            assert.equal(p.value, 'test')
        })
    })
}