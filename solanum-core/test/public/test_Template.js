import assert from 'assert'
import jsdom from 'mocha-jsdom'

import Template from '../../public/lib/template.js'

describe('template', function() {
    jsdom({
        url: 'http://example.org/',
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
})