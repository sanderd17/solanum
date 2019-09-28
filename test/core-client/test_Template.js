import assert from 'assert'
import jsdom from 'jsdom'
const JSDOM = jsdom.JSDOM

import Template from '/lib/template.js'

export default function({describe, it, beforeEach}) {
    beforeEach(function() {
        const d = new JSDOM('', {
            url: 'http://example.org/',
        })
        global.document = d.window.document
    })
    describe('constructor', function() {
        it('Creates a div element', function() {
            let cmp = new Template({})
            assert.equal(cmp.__dom.nodeName, 'DIV')
        })
    })
    describe('classList', function() {
        it('equals the dom class list', function() {
            let cmp = new Template({})
            assert.equal(cmp.__dom.classList, cmp.classList)
        })
        it("contains 'solanum'", function() {
            let cmp = new Template({})
            assert(cmp.classList.contains('solanum'))
        })
    })
}