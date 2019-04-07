const assert = require('assert')
const xml2js = require('xml-js')

import recast from 'recast'
import path from 'path'
import Editor from '../src/Editor.js'


assert.equalXml = function(xml1, xml2) {
    return assert.deepEqual(xml2js.xml2js(xml1), xml2js.xml2js(xml2))
}

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
    describe('UpdateCode', function() {
        it.skip('Should update code', function() {

        })
    })
    describe('CheckBody', function() {
        it('Should check an object for type', function() {
            let body = {
                key1: 'test',
                key2: 123
            }
            let sentStatus, sentMessage
            let response = {
                status: (status) => sentStatus = status,
                send: (msg) => sentMessage = msg,
                headersSent: false
            }


        })
    })
    describe('updateSvgViaAst', function() {
        it('Should return false when no SVG is found', function() {
            let editor = new Editor({}, {})
            assert.equal(editor.updateSvgViaAst('', ''), false)
        })
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
        })
        it('Should error out on invalid code', function() {
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
            assert.throws(() => editor.updateSvgViaAst(code, "<svg>version2</svg>"), Error)
        })
    })
    describe('cleanSvg', function() {
        it('Errors on invalid XML', function() {
            let editor = new Editor({}, {})
            assert.throws(() => editor.cleanSvg("ThisIsNotValid", {}), Error)
        })
        it('Should not change most minimal SVG', function() {
            let editor = new Editor({}, {})
            assert.equalXml(editor.cleanSvg("<svg></svg>", {}), "<svg></svg>")
        })
        it('Should add custom attributes', function() {
            let editor = new Editor({}, {})
            assert.equalXml(editor.cleanSvg("<svg/>", {myAttr: 'solanum'}), '<svg myAttr="solanum"/>')
        })
        it('Keeps comments', function() {
            let editor = new Editor({}, {})
            assert((editor.cleanSvg("<svg><!--comment--></svg>", {})).includes('comment'))
        })
        it("Doesn't change empty groups", function() {
            let editor = new Editor({}, {})
            assert.equalXml(editor.cleanSvg("<svg><g></g></svg>", {}), "<svg><g></g></svg>")
        })
        it("Keeps elements in the first group", function() {
            let editor = new Editor({}, {})
            assert.equalXml(editor.cleanSvg("<svg><g><rect x='10' y='10'/></g></svg>", {}), "<svg><g><rect x='10' y='10'/></g></svg>")
        })
        it('Removes style attributes', function() {
            let editor = new Editor({}, {})
            assert.equalXml(editor.cleanSvg("<svg><g><rect x='10' y='10' style='test'/></g></svg>", {}), "<svg><g><rect x='10' y='10'/></g></svg>")
        })
        it.skip('Should remove null attributes', function() {

        })
        it.skip('Should fix the ids', function() {

        })
    })
    describe('setComponentEventHandler', function() {
        it('Should replace an existing arrowfunction', function() {
            let editor = new Editor({}, {})

            let codes = []
            for (let i of [1, 2]) {
                codes.push(`
                    import Template from '../lib/template.js'

                    class MyComponent extends Template {}

                    MyComponent.prototype.domBindings = {
                        'el': {
                            'click': (cmp, event) => {let val${i} = event}
                        }
                    }

                    export default MyComponent
                `)
            }
            const newFunctionAst = recast.parse("(cmp, event) => {let val2 = event}")
            let newCode = editor.updateEventHandlerViaAst(codes[0], 'el', 'click', newFunctionAst.program.body[0].expression);

            assert.equal(codes[1], newCode)
        })
        it('Should add a new event to an existing object', function() {
            let editor = new Editor({}, {})

            let code1 = `
                import Template from '../lib/template.js'

                class MyComponent extends Template {}

                MyComponent.prototype.domBindings = {
                    'el': {
                    }
                }

                export default MyComponent
            `
            let code2 = `
                import Template from '../lib/template.js'

                class MyComponent extends Template {}

                MyComponent.prototype.domBindings = {
                    'el': {
                        click: (cmp, event) => {let val2 = event}
                    }
                }

                export default MyComponent
            `
            const newFunctionAst = recast.parse("(cmp, event) => {let val2 = event}")
            let newCode = editor.updateEventHandlerViaAst(code1, 'el', 'click', newFunctionAst.program.body[0].expression);

            assert.equal(code2, newCode)
        })
        it('Should error out on invalid code', function() {
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
            assert.throws(() => editor.updateSvgViaAst(code, "<svg>version2</svg>"), Error)
        })
    })
})
