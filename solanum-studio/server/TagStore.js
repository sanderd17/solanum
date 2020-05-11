
class TagStore {
    /**
     * @param {*} config 
     */
    constructor(config) {
        this.config = config
    }

    /**
     * @param {string} tagset 
     * @returns {string} absolute path to the tag file on disk
     */
    getTagfilePath(module, component) {
        return "TODO"
    }

    getFile(tagset) {
        let filePath = this.getTagfilePath(tagset)
        return new File(filePath)
    }

}

export default TagStore