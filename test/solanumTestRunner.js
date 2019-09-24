import {promises as fs} from 'fs'
import { fileURLToPath } from 'url';
import path from 'path';

import chalk from 'chalk'
import yargs from 'yargs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let baseDir = __dirname
if ('d' in yargs.argv) {
    baseDir = path.join(baseDir, yargs.argv.d)
}

async function runTests(dir) {
    let files = await fs.readdir(dir)

    for (let f of files) {
        let fullPath = path.join(dir, f)
        let stat = await fs.lstat(fullPath)
        if (stat.isDirectory()) {
            await runTests(fullPath)
        } else if (f.startsWith('test_')) {
            let mdl = await import('file:' + fullPath)
            console.log('\n' + chalk.bold.blue(f.split('_').pop()))
            await mdl.default(supportFunctions)
        }
    }
}

runTests(baseDir)
    .then((v) => console.log(chalk.black.bgGreen('\nAll tests successful\n')))
    .catch(err => console.error(err))

let supportFunctions = {}
supportFunctions.before = function(fn) {
    throw Error('Not implemented yet')
    // runs before all tests in this file regardless where this line is defined.
}

supportFunctions.after = function(fn) {
    throw Error('Not implemented yet')
    // runs after all tests in this file
}

supportFunctions.beforeEach = function(fn) {
    throw Error('Not implemented yet')
    // runs before each test in this block
}

supportFunctions.afterEach = function(fn) {
    throw Error('Not implemented yet')
    // runs after each test in this block
}


supportFunctions.describe = async function(name, fn) {
    console.log('  ' + name)
    let r = fn()
    if (r && 'then' in r) {
        await r
    }
},

supportFunctions.it = async function(action, fn) {
    let r = fn()
    if (r && 'then' in r) {
        await r
    }
    console.log(chalk.green('  ' + '✓ ' + action))
}

supportFunctions.it.skip = function(action, fn) {
    console.log(chalk.cyan('  ' + '- ' + action))
}