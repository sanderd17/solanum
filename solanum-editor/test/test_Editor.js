const assert = require('assert')

import path from 'path'
import Editor from '../src/Editor.js'


describe('Editor', function() {
    describe('constructor', function() {
        it('constructs', function() {

        })
    })
    describe('getComponentPaths', function() {
        it('Should return all valid components', function(done) {
            let config = {
                editableDirs: {
                    "module1": path.join(__dirname, 'testModules/module1/'),
                    "module2": path.join(__dirname, 'testModules/module2/'),
                },
            }
            let editor = new Editor({}, config)
            const response = {send: function(filesPerModule) {
                assert.deepEqual(filesPerModule, {
                    module1: [ 'file1.js', 'file2.js' ],
                    module2: [ 'file1.js', 'file3.js' ]
                })
            }}
            editor.getComponentPaths(null, response).then(() => done()).catch((err) => assert.fail(err))
        })
    }),
    describe('openComponent', function() {
        it(('Should return the contents of the correct component'), function(done) {
            let config = {
                editableDirs: {
                    "module1": path.join(__dirname, 'testModules/module1/'),
                    "module2": path.join(__dirname, 'testModules/module2/'),
                },
            }
            let editor = new Editor({}, config)
            const response = {sendFile: function(fileName) {
                assert(fileName.endsWith('/module2/file1.js'))
            }}
            editor.openComponent({body:{module: 'module2', file: 'file1.js'}}, response)
            done()
        })
    }),
    describe('updateSvgViaAst', function() {
        it('Should return false when no SVG is found', function() {
            let editor = new Editor({}, {})
            assert.equal(editor.updateSvgViaAst('', ''), false)
        }),
        it.skip('Should replace found SVG content', function() {
        })
    })
})
