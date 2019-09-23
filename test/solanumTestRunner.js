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
            await import('file:' + fullPath)
        }
    }
}

runTests(baseDir)
    .then((v) => console.log(chalk.black.bgGreen('\nAll tests successful\n')))
    .catch(err => console.error(err))