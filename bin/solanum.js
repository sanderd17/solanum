#!/usr/bin/env node
const inquirer = require('inquirer')
const fs = require('fs')
const { spawn } = require('child_process')
const program = require('commander')

const packageVersion = require('../package.json').version

program.version(packageVersion)
program
  .command('install').alias('i')
  .description('Create a new Solanum project in the current directory')
  .action(() => {
      install()
  });

program.parse(process.argv);

async function install() {

    const defaultPackages = {
        'solanum-core': '^' + packageVersion
    }

    const optionalPackages = {
        'solanum-studio': '^' + packageVersion,
    }

    let questions = [
        {
            type : "input",
            name : "name",
            message : "Project name: ",
            default: 'My-Project',
        },
        {
            type : "input",
            name : "version",
            message : "Version: ",
            default: '1.0.0',
        },
        {
            type : "input",
            name : "description",
            message : "Description: ",
        },
        {
            type : "input",
            name : "author",
            message : "Author: ",
        },
        {
            type : "checkbox",
            name : "dependencies",
            message : "Select additional modules: ",
            choices: [
                new inquirer.Separator(' --- Editor --- '),
                {
                    name: 'solanum-studio',
                    checked: true
                },
            ]
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Confirm installation?',
            default: true
        }
    ]

    console.log(`
    This utility will walk you through creating a solanum project in the current directory.
    It only covers the most common items, and tries to guess sensible defaults.

    Solanum uses npm for packaging.
    Use 'npm install -s <pkg>' afterwards to install a package and
    save it as a dependency in the package.json file.

    Press ^C at any time to quit.
    `)

    let {name, version, description, author, dependencies, confirm} = await inquirer.prompt(questions)

    if (!confirm) {
        console.log('Aborting installation')
        return
    }
    let packageJson = {
        name,
        version,
        description,
        author,
        main: 'index.js',
        dependencies: {},
    }
    
    for (let d of dependencies) {
        packageJson.dependencies[d] = optionalPackages[d]
    }
    for (let [p,v] of Object.entries(defaultPackages)) {
        packageJson.dependencies[p] = v
    }

    console.log(packageJson)

    fs.writeFileSync('./package.json', JSON.stringify(packageJson))

    const child = spawn('npm', ['install', process.cwd()], {stdio: [process.stdin, process.stdout, process.stderr]})

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
