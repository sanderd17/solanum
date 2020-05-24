import assert from 'assert'

import recast from 'recast'
import flow from 'flow-parser'
import ComponentModifier from '../../solanum-studio/server/ComponentModifier.js'

const parseOptions = {
    'parser': {
        parse: c => flow.parse(c, {
            esproposal_class_instance_fields: true,
            esproposal_class_static_fields: true,
        }), // Flow parser supports class fields https://github.com/tc39/proposal-class-fields
    }
}

/**
 * @param {string} js1 
 * @param {string} js2
 */
assert.equalJS = function(js1, js2) {
    let output1 = recast.prettyPrint(recast.parse(js1, parseOptions)).code;
    let output2 = recast.prettyPrint(recast.parse(js2, parseOptions)).code;
    return assert.equal(output1, output2)
}

const startCode = `
import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

class TestComponent extends Template {
    children = {
        child1: new Child({
            parent: this,
            position: {left: '0', width: '100%', top: '0', height: '100%'},
            properties: {childProp: 0},
            eventHandlers: {ev1: () => {}}
        })
    }

    properties = {
        "prop1" = new Prop('val1')
    }
}

export default TestComponent
`

export default function({describe, it}) {
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
            assert(newCode.includes('child2:'))
            assert(newCode.includes('new Child2('))
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
    describe('setChildProp', function() {
        it('Should set a prop of a child', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.setChildProp('child1', 'myProp', "'myVal'")
            let newCode = cmpMod.print()

            assert(newCode.includes('myProp:'))
            assert(newCode.includes('myVal'))
        })
    })
    describe('removeChildProp', function() {
        it('Should remove a prop of a child', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.removeChildProp('child1', 'childProp')
            let newCode = cmpMod.print()

            assert(!newCode.includes('childProp'))
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
    describe('setProp', function() {
        it('Should add a new prop with a text body', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.setProp('prop2', "'newVal'")
            let newCode = cmpMod.print()

            assert(newCode.includes('prop2: new Prop('))
            assert(newCode.includes("'newVal'"))
        })
        it('Should alter an existing prop', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.setProp('prop1', "'newVal'")
            let newCode = cmpMod.print()

            assert(newCode.includes("'newVal'"))
        })
    })
    describe('removeProp', function() {
        it('Should remove a prop', function() {
            let cmpMod = new ComponentModifier(startCode)
            cmpMod.removeProp('prop1')
            let newCode = cmpMod.print()

            assert(!newCode.includes('prop1'))
        })
    })
}