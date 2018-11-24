const assert = require('assert')

import Template from '../gui/lib/template.js'
import {EvalTagPath} from '../gui/lib/template.js'

describe('EvalTagPath', function() {
    it("Doesn't replace unneeded", function() {
        const tp = "tagPath"
        const ctx = {}
        assert.equal(tp, EvalTagPath(ctx, tp))
    })
    it("Does single replace", function() {
        const tp = "{repl}"
        const ctx = {'repl': 'replacement'}
        assert.equal('replacement', EvalTagPath(ctx, tp))
    })
    it("Does mid-string replace", function() {
        const tp = "tag.path{repl}_a.measure"
        const ctx = {'repl': '1'}
        assert.equal('tag.path1_a.measure', EvalTagPath(ctx, tp))
    })
})