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
            let file = f.split('_').pop()
            console.log('\n' + chalk.bold.blue(file))
            beforeFunctions = []
            afterFunctions = []
            descriptions = []
            await mdl.default(supportFunctions)
            for (let d of descriptions) {
                d.file = file
                await runDescription(d)
            }
        }
    }
}

function showError({numError, err, file, descriptor, action}) {
    console.log()
    console.log(chalk.bgRed(`(${numError})`) + chalk.bold.red(` ${file} :: ${descriptor} :: ${action}`))
    let stack = err.stack
    let stackList = stack.split('\n')
    stackList[0] = chalk.bold(stackList[0])
    stackList.splice(stackList.length - 3, 3)
    for (let i = 1; i < stackList.length; i++) {
        stackList[i] = chalk.dim(stackList[i])
    }
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

/** @type {{file: string?, descriptor: string, fn:Function}[]} */
let descriptions = []
/**
 * @param {string} descriptor
 * @param {Function} fn
 */
supportFunctions.describe = async function(descriptor, fn) {
    descriptions.push({file: null, descriptor, fn})
}

/** @param {{file: string, descriptor: string, fn: Function}} param0 */
async function runDescription({file, descriptor, fn}) {
    testers = []
    console.log('  ' + descriptor)
    await fn()
    for (let t of testers) {
        await runTest(t, descriptor, file)
    }
}

/** @type {{numError: number, err: Error, file: string, descriptor: string, action: string}[]} list of gathered errors while testing */
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

let testsRan = 0

/** 
 * @param {{action: string, fn: Function}} testFunction
 * @param {string} descriptor
 */
async function runTest({fn, action}, descriptor, file) {
    for (let beforeFn of beforeFunctions) {
        beforeFn()
    }
    try {
        await fn()
        console.log(chalk.green('  ✓ ' + action))
        testsRan++
    } catch (err) {
        let numError = errorList.length + 1
        errorList.push({numError, file, descriptor, action, err})
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
            console.log(chalk.black.bgGreen(`\n ${testsRan} tests successful\n`))
            return
        }
        for (let e of errorList) {
            showError(e)
        }

        if (numErrors == 1)
            console.error(`\n${testsRan} tests sucessful; ` + chalk.bgRed(`1 TEST FAILED \n`))
        else
            console.error(`\n${testsRan} tests sucessful; ` + chalk.bgRed(`${numErrors} TESTS FAILED`))
        process.exit(1)
    })
    .catch(err => {
        // This means errors didn't happen while the tests were run, but when importing files or running 0
        console.error(chalk.bgRed('An exception happened in the test runner'))
        console.error(err)
        process.exit(2)
    })