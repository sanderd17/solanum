import path from 'path'
import fs from 'graceful-fs'
import steno from 'steno'
import readdir from 'recursive-readdir'
import util from 'util'

class ComponentStore {

    /**
     * Construct the editor interface of the app
     * @param {*} config JSON configuration
     */
    constructor(config) {
        /** Configuration of the app (see /config.js)*/
        this.config = config
    }

    /**
     * @returns {Promise<Object>} List of templates wrapped in an object per module
     */
    async getComponentPaths() {
        // TODO candidate for caching?
        const modules = Object.keys(this.config.editableDirs)
        const editableDirs = modules.map((k) => this.config.editableDirs[k])

        const fileLists = await Promise.all(
            editableDirs.map(dir => readdir(dir))
        )
        const filesPerModule = modules.reduce((obj, k, i) => ({...obj, [k]: fileLists[i] }), {})

        for (let key in filesPerModule) {
            let prefixLength = this.config.editableDirs[key].length
            filesPerModule[key] = filesPerModule[key].map(f => f.substring(prefixLength)).sort()
        }

        return filesPerModule
    }

    /**
     * 
     * @param {string} module 
     * @param {string} component 
     * @returns {string} absolute path to the component on disk
     */
    getComponentPath(module, component) {
        const directory = this.config.editableDirs[module]
        return path.join(directory, component)
    }

    getFile(module, component) {
        let filePath = this.getComponentPath(module, component)
        return new File(filePath)
    }

    createComponent(module, component) {
        let filePath = this.getComponentPath(module, component)
        let contents = `
import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'

class ${component} extends Template {
    static defaultSize = [100, 100]
    static children = {}
}

export default ${component}
`
        writeFile(filePath, contents)
    }
}


let fileLocks = new Set()
const lockRetryTime = 10 //ms
const maxLockWaitTime = 5000 //ms

class File {
    /**
     * @param {string} filePath 
     */
    constructor(filePath) {
        this.filePath = filePath
        this.isRead = false
        this.isWritten = false
    }

    async waitUntilUnlocked() {
        let waitTime = 0
        while (fileLocks.has(this.filePath)) {
            if (waitTime > maxLockWaitTime)
                throw new Error(`Could not aquire lock for ${this.filePath} afer ${waitTime} ms`)
            await timeout(lockRetryTime)
            waitTime += lockRetryTime
        }
    }

    /**
     * Lock and open a file
     * @returns {Promise<string>} File contents
     * @throws {Error} When lock took too long to release, or content could not be read
     */
    async read() {
        if (this.isRead)
            throw new Error(`Error, file with path ${this.filePath} is being read twice`)
        this.isRead = true

        await this.waitUntilUnlocked()
        fileLocks.add(this.filePath)
        console.log(this.filePath)
        return await readFile(this.filePath, {encoding: 'utf-8'})
    }

    async read_NOLOCK() {
        return await readFile(this.filePath, {encoding: 'utf-8'})
    }

    async write(newCode) {
        if (this.isWritten)
            throw new Error(`Error, file with path ${this.filePath} is being written twice`)
        this.isWritten = true

        await writeFile(this.filePath, newCode)
        fileLocks.delete(this.filePath)
    }
}

// TODO move promisified functions to library
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(steno.writeFile)
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export default ComponentStore