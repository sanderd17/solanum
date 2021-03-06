import assert from 'assert'
import jsdom from 'jsdom'
const JSDOM = jsdom.JSDOM

import Template from '/lib/template.js'

export default function({describe, it, beforeEach}) {
    beforeEach(function() {
        const d = new JSDOM('', {
            url: 'http://solanum.org/',
        })
        global.document = d.window.document
        global.window = d.window
    })
    describe('constructor', function() {
        it('creates a div element', function() {
            let cmp = new Template({})
            assert.equal(cmp.dom.nodeName, 'DIV')
        })
    })
    describe('classList', function() {
        it('equals the dom class list', function() {
            let cmp = new Template({})
            cmp.init()
            assert.equal(cmp.dom.classList, cmp.classList)
        })
        it("contains 'solanum'", function() {
            let cmp = new Template({})
            cmp.init()
            assert(cmp.classList.contains('solanum'))
        })
    })
}