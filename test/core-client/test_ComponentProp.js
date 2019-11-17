import assert from 'assert'
import jsdom from 'jsdom'
const JSDOM = jsdom.JSDOM

import Prop from '/lib/ComponentProp.js'

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
        it("Doesn't throw an error on any variable name", () => {
            let p = new Prop("anyVariableName")
            assert.equal(typeof p.bindingFunction, "function")
        })
        it('Throws an error on a syntax fault', () => {
            assert.throws(() => {let p = new Prop("(")})
        })
    })
    describe('getTagSubscriptionValue', function() {
        it('Sets a prop binding function', function () {
            assert.fail('TODO')
        })
    })
    describe('recalcValue', function() {
        it('Returns a number string as number', () => {
            let p = new Prop("123")
            p.recalcValue({})
            assert.equal(p.value, 123)
        })
        it('Returns a string string as string', () => {
            let p = new Prop("'test'")
            p.recalcValue({})
            assert.equal(p.value, "test")
        })
        it('Calculates a mathematical expression', () => {
            let p = new Prop("2 + 3")
            p.recalcValue({})
            assert.equal(p.value, 5)
        })
        it('Has access to the given component', () => {
            let p = new Prop("cmp.a")
            p.recalcValue({a: 123})
            assert.equal(p.value, 123)
        })
        it('Can subscribe to a tag', () => {
            let p = new Prop("Tag('myTagPath')")
            let numCalls = 0
            p.getTagSubscriptionValue = function(tagPath, defaultValue, subscribedTagValues) {
                numCalls += 1
                subscribedTagValues[tagPath] = 123
                return 123
            }
            p.recalcValue({})
            assert.equal(p.value, 123)
            assert.equal(numCalls, 1)
            assert.equal(p.subscribedTagValues.myTagPath, 123)
        })
        it('Can remove a tag subscription', () => {
            let p = new Prop("123")
            p.subscribedTagValues.myTagPath = 123
            let numCalls = 0
            p.removeTagSubscription = () => {numCalls++}
            p.recalcValue({})
            assert.equal(p.value, 123)
            assert.equal(numCalls, 1)
            assert.equal(p.subscribedTagValues.myTagPath, undefined)
        })
    })
    describe('setPropValue', function() {
        it('Sets a prop value', function() {
            assert.fail('TODO')
        })
    })
}