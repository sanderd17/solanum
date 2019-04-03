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
            editor.openComponent({body:{module: 'module2', component: 'file1.js'}}, response)
            done()
        })
    }),
    describe('updateSvgViaAst', function() {
        it('Should return false when no SVG is found', function() {
            let editor = new Editor({}, {})
            assert.equal(editor.updateSvgViaAst('', ''), false)
        }),
        it('Should replace found SVG content', function() {
            let editor = new Editor({}, {})

            let codes = []
            for (let i of [1, 2]) {
                codes.push(`
                    import Template from '../lib/template.js'

                    class MyComponent extends Template {}

                    MyComponent.prototype.class = 'mycomponent'
                    MyComponent.prototype.size = [10,10]


                    MyComponent.prototype.render = function() {
                        return this.svg\`<svg>version${i}</svg>\`;
                    }

                    export default MyComponent
                `)
            }
            let newCode = editor.updateSvgViaAst(codes[0], "<svg>version2</svg>");

            assert.equal(codes[1], newCode)
        }),
        it('Should do something on invalid code', function() {
            let editor = new Editor({}, {})

            let code = `
                import Template from '../lib/template.js'


                class MyComponent extends Template {}

                MyComponent.prototype.wrongFunction = function() {
                    this js is invalid
                }

                MyComponent.prototype.render = function() {
                    return this.svg\`<svg>version1</svg>\`;
                }

            `
            console.log(editor.updateSvgViaAst(code, "<svg>version2</svg>"))

        }),
    })
})
