import assert from 'assert'
//import jsdom from 'mocha-jsdom'

import {describe, it} from '../solanumTestStructure.js'

import Template from '/lib/template.js'

describe('Template', function() {
    /*jsdom({
        url: 'http://example.org/',
    })*/
    describe('constructor', function() {
        it.skip('Creates a div element', function() {
            /*let cmp = new Template({})
            assert.equal(cmp.__dom.nodeName, 'DIV')
            */
        })
    })
    describe('classList', function() {
        it('equals the dom class list', function() {
            /*let cmp = new Template({})
            assert.equal(cmp.__dom.classList, cmp.classList)*/
        })
        it("contains 'solanum'", function() {
            /*let cmp = new Template({})
            assert(cmp.classList.contains('solanum'))*/
        })
    })
})