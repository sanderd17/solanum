import chalk from 'chalk'

export function before(fn) {
    throw Error('Not implemented yet')
    // runs before all tests in this file regardless where this line is defined.
}

export function after(fn) {
    throw Error('Not implemented yet')
    // runs after all tests in this file
}

export function beforeEach(fn) {
    throw Error('Not implemented yet')
    // runs before each test in this block
}

export function afterEach(fn) {
    throw Error('Not implemented yet')
    // runs after each test in this block
}


var depth = 0
export function describe(name, fn) {
    if (depth == 0)
        console.log()
    console.log('  '.repeat(depth) + name)
    depth++
    fn()
    depth--
}

function it(action, fn) {
    let r = fn()
    console.log(chalk.green('  '.repeat(depth) + '✓ ' + action))
    /*
    Promise.resolve(r)
        .then((v) => console.log('  '.repeat(depth) + '✓ ' + action))
        .catch(err => console.log('Error ', err.message))
        */
}

it.skip = function(action, fn) {
    console.log(chalk.cyan('  '.repeat(depth) + '- ' + action))
}

export {it}