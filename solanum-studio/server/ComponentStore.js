import path from 'path'
import readdir from 'recursive-readdir'
import File, {writeFile} from './utils/LockableFile.js'
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

// TODO move promisified functions to library

export default ComponentStore