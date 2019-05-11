const assert = require('assert')
const xml2js = require('xml-js')

import recast from 'recast'
import path from 'path'
import StudioAPI from '../src/StudioAPI.js'


/**
 * @param {string} xml1 
 * @param {string} xml2
 */
assert.equalXml = function(xml1, xml2) {
    return assert.deepEqual(xml2js.xml2js(xml1), xml2js.xml2js(xml2))
}

describe('Studio', function() {
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
            let editor = new StudioAPI({}, config)
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
            let editor = new StudioAPI({}, config)
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
})
