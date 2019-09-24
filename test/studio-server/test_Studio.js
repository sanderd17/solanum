import assert from 'assert'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import StudioAPI from '../../solanum-studio/src/StudioAPI.js'


export default async function({describe, it}) {
    await describe('getComponentPaths', async function() {
        await it('Should return all valid components', async function() {
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
    await describe('openComponent', async function() {
        await it('Should return the contents of the correct component', async function() {
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
            await editor.openComponent({query:{module: 'module2', component: 'file1.js'}}, response)
        })
    })
}
