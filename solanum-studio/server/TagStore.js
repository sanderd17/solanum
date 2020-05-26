import File, {writeFile} from './utils/LockableFile.js'

class TagStore {
    /**
     * @param {*} config 
     * @param {import('../../solanum-core/server/TagSet').default} ts
     */
    constructor(config, ts) {
        this.config = config
        this.ts = ts
    }

    /**
     * @param {string} tagsetName
     * @returns {string} absolute path to the tag file on disk
     */
    getTagfilePath(tagsetName) {
        return this.ts.tagFiles[tagsetName]
    }

    getFile(tagset) {
        let filePath = this.getTagfilePath(tagset)
        return new File(filePath)
    }

}

export default TagStore