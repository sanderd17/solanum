
import assert from 'assert'
import jsdom from 'jsdom'
const JSDOM = jsdom.JSDOM

import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || 0))
}

/**
 * Test the connection between templates and props
 * Templates are responsible for the recalculation of changed props
 */
export default function({describe, it, beforeEach}) {
    let child, parent
    beforeEach(function() {
        const d = new JSDOM('', {
            url: 'http://solanum.org/',
        })
        global.document = d.window.document
        child = class extends Template {
            constructor(...args) {
                super(...args)
                this.init()
            }
            properties = {
                myProp: new Prop('a')
            }
        }
        parent = class extends Template {
            constructor(...args) {
                super(...args)
                this.init()
            }
            children = {
                child1: new child({
                    parent: this,
                    position: {},
                    properties: {
                        myProp: 'b',
                    }
                })
            }
        }
    })
    describe('Construction', function() {
        it('Definition from the parent overrides the child', async () => {
            let cmp = new parent({
                parent: null,
                position: {},
                properties: {}
            })
            // sleep for a tick to let the constructor run
            assert.equal(cmp.children.child1.prop.myProp, "b")
        })
    })
    // TODO check child prop can depend on prop that comes from parent, check parent-defined prop can depend on other parent prop
    // TODO check updates when prop dependencies change
    describe('Modification notification', () => {
        it.skip('Calls the PropertModified function on modification', () => {
            assert.fail('TODO')
        })
    })
}