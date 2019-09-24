import assert from 'assert'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import StudioAPI from '../../solanum-studio/src/StudioAPI.js'


export default function({describe, it}) {
    describe('getComponentPaths', function() {
        it('Should return all valid components', async function() {
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
            await editor.getComponentPaths(null, response)
        })
    })
    describe('openComponent', function() {
        it.skip(('Should return the contents of the correct component'), function(done) {
            let config = {
                editableDirs: {
                    "module1": path.join(__dirname, 'testModules/module1/'),
                    "module2": path.join(__dirname, 'testModules/module2/'),
                },
            }
            let editor = new StudioAPI({}, config)
            const response = {sendFile: function(fileName) {
                assert(fileName.endsWith('/module2/file1.js'))
                assert.fail('support async tests')
            }}
            editor.openComponent({query:{module: 'module2', component: 'file1.js'}}, response)
        })
    })
}
