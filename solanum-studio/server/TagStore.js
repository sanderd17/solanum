
class TagStore {
    /**
     * @param {*} config 
     */
    constructor(config) {
        this.config = config
    }

    /**
     * 
     * @param {string} module 
     * @param {string} component 
     * @returns {string} absolute path to the component on disk
     */
    getTagfilePath(module, component) {
        const directory = this.config.editableDirs[module]
        return path.join(directory, component)
    }

    getFile(module, component) {
        let filePath = this.getTagfilePath(module, component)
        return new File(filePath)
    }

}

export default TagStore