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
            beforeFunctions = []
            afterFunctions = []
            descriptions = []
            await mdl.default(supportFunctions)
            for (let d of descriptions) {
                await runDescription(d)
            }
        }
    }
}

function showError({numError, err, descriptor, action}) {
    console.log()
    console.log(chalk.bgRed(`(${numError}) ${descriptor} :: ${action}`))
    let stack = err.stack
    let stackList = stack.split('\n')
    stackList.splice(stackList.length - 3, 3)
    console.log(stackList.join('\n'))
}


let supportFunctions = {}

/** @type {Function[]} */
let beforeFunctions = []
supportFunctions.beforeEach = function(fn) {
    // runs before each test in this file, needs to be defined at the top
    beforeFunctions.push(fn)
}

/** @type {Function[]} */
let afterFunctions = []
supportFunctions.afterEach = function(fn) {
    // runs after each test in this file, needs to be defined at the top
    afterFunctions.push(fn)
}

/** @type {{descriptor: string, fn:Function}[]} */
let descriptions = []
/**
 * @param {string} descriptor
 * @param {Function} fn
 */
supportFunctions.describe = async function(descriptor, fn) {
    descriptions.push({descriptor, fn})
}

/** @param {{descriptor: string, fn: Function}} param0 */
async function runDescription({descriptor, fn}) {
    testers = []
    console.log('  ' + descriptor)
    await fn()
    for (let t of testers) {
        await runTest(t, descriptor)
    }
}

/** @type {{numError: number, err: Error, descriptor: string, action: string}[]} list of gathered errors while testing */
let errorList = []
/** @type {{action: string, fn: Function}[]} list of tests to run for the active descriptor*/
let testers = []
/**
 * @param {string} action
 * @param {Function} fn
 */
supportFunctions.it = async function(action, fn) {
    testers.push({action, fn})
}

/** 
 * @param {{action: string, fn: Function}} testFunction
 * @param {string} descriptor
 */
async function runTest({fn, action}, descriptor) {
    for (let beforeFn of beforeFunctions) {
        beforeFn()
    }
    try {
        await fn()
        console.log(chalk.green('  ✓ ' + action))
    } catch (err) {
        let numError = errorList.length + 1
        errorList.push({numError, descriptor, action, err})
        console.log(chalk.bgRed(`  E (${numError}) ` + action))
    }
    for (let afterFn of afterFunctions) {
        afterFn()
    }
}

/**
 * @param {string} action
 * @param {Function} fn
 */
supportFunctions.it.skip = function(action, fn) {
    console.log(chalk.cyan('  ' + '- ' + action))
}

runTests(baseDir)
    .then((v) => {
        let numErrors = errorList.length
        if (numErrors == 0) {
            console.log(chalk.black.bgGreen('\nAll tests successful\n'))
            return
        }
        for (let e of errorList) {
            showError(e)
        }

        if (numErrors == 1)
            console.error(chalk.bgRed(`\n 1 TEST FAILED \n`))
        else
            console.error(chalk.bgRed(`\n ${numErrors} TESTS FAILED`))
        process.exit(1)
    })
    .catch(err => {
        // This means errors didn't happen while the tests were run, but when importing files or running 0
        console.error(chalk.bgRed('An exception happened in the test runner'))
        console.error(err)
        process.exit(2)
    })