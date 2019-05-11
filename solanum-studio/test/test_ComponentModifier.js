const assert = require('assert')

import recast from 'recast'
import ComponentModifier from '../src/ComponentModifier.js'


/**
 * @param {string} js1 
 * @param {string} js2
 */
assert.equalJS = function(js1, js2) {
    let output1 = recast.prettyPrint(recast.parse(js1)).code;
    let output2 = recast.prettyPrint(recast.parse(js2)).code;
    return assert.equal(output1, output2)
}

const startCode = `
import Template from '../lib/template.js'

class TestComponent extends Template {

    constructor(p) {
        super(p)

        this.setChildren({
            child1: new Child({
                position: {left: '0', width: '100%', top: '0', height: '100%'},
                props: {},
                eventHandlers: {ev1: () => {}}
            })
        })
    }
}

TestComponent.prototype.defaultProps = {
    'defaultProp1': 'val1'
}

export default TestComponent
`

describe('ComponentModifier', function() {
    describe('equalityTester', function() {
        it('Should test equal on itself', function() {
            assert.equalJS(startCode, startCode)
        })
        it('Should test equal on whitespace modifications', function() {
            let codeArr = startCode.split('\n')
            codeArr.splice(5,0,'\n\n\n')
            let newCode = codeArr.join('\n')
            assert.equalJS(startCode, newCode)
        })
        it.skip('Should test unequal on other modifications', function() {
            assert.fail()
        })
    })

    describe('addChildComponent', function() {
        let cmpMod = new ComponentModifier(startCode)
        cmpMod.addChildComponent('child2', 'Child2', 'modules/Child2.js', {left: '0', width: '100%', top: '0', height: '100%'})
        let newCode = cmpMod.print()
        it('Shoull add a new import', function() {
            assert(newCode.includes("import Child2 from 'modules/Child2.js'"))
        })
        it('Should add the child id', function() {
            assert(newCode.includes('child2: new Child2'))
        })
    })

    describe('removeChildComponent', function() {
        it('Should remove the child', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.removeChildComponent('child1')
            let newCode = cmpMod.print()

            assert(!newCode.includes('child1'))
        })
    })
    describe('setChildPosition', function() {
        it('Should set the position of the child', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.setChildPosition('child1', {left: '10%', width: '80%', top:'10%', height:'80%'})
            let newCode = cmpMod.print()

            assert(newCode.includes('left: "10%"'))
        })
    })
    describe('setChildEventHandler', function() {
        it('Should add an event handler of a child', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.setChildEventHandler('child1', 'ev2', `(ev) => {console.log(ev)}`)
            let newCode = cmpMod.print()

            assert(newCode.includes('ev2:'))
            assert(newCode.includes('console.log(ev)'))
        })
        it('Should replace an event handler of a child', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.setChildEventHandler('child1', 'ev1', `(ev) => {console.log(ev)}`)
            let newCode = cmpMod.print()

            assert(newCode.includes('ev1:'))
            assert(newCode.includes('console.log(ev)'))
        })
    })
    describe('removeChildEventHanlder', function() {
        it('Should remove an existing handler', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.removeChildEventHandler('child1', 'ev1')
            let newCode = cmpMod.print()

            assert(!newCode.includes('ev1:'))
        })
    })
})