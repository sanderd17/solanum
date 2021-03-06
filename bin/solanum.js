#!/usr/bin/env node
const prompts = require('prompts')
const fs = require('fs')
const { spawn } = require('child_process')
const program = require('commander')
const path = require('path')

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
        'solanum-core': '^' + packageVersion,
    }

    const optionalPackages = {
        'solanum-studio': '^' + packageVersion,
    }

    let questions = [
        {
            type : "text",
            name : "name",
            message : "Project name: ",
            initial: 'My-Project',
        },
        {
            type : "text",
            name : "version",
            message : "Version: ",
            initial: '1.0.0',
        },
        {
            type : "text",
            name : "description",
            message : "Description: ",
        },
        {
            type : "text",
            name : "author",
            message : "Author: ",
        },
        {
            type : "multiselect",
            name : "dependencies",
            message : "Select additional modules: ",
            choices: [
                {
                    title: 'Solanum Studio',
                    value: 'solanum-studio',
                    selected: true
                },
            ]
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Confirm installation?',
            initial: true
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

    let {name, version, description, author, dependencies, confirm} = await prompts(questions)

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
        if (code == 0) 
            console.log('INSTALLATION SUCCESSFUL')
        else
            console.error(`ERROR: npm install process exited with code ${code}`);
    });

    let config = {
        app: {
            port: 8840,
        },
        publicDirs: [
            path.join(process.cwd(), 'public/'),
        ],
        editableDirs: {
            "main": path.join(process.cwd(), 'public/templates/'),
        },
        tags: {
            files: [
                path.join(process.cwd(), 'tags/default.js'),
            ]
        }
    }

    for (let p of Object.keys(defaultPackages)) {
        let dir = path.join(process.cwd(), 'node_modules', p, 'public')
        config.publicDirs.push(dir)
        config.publicDirs[p] = dir 
    }

    let configFile = `
const config = ${JSON.stringify(config, null, '\t')}

export default config
`
    fs.writeFileSync('./config.js', configFile)

    //TODO write all files from data/ to the current dir
}
