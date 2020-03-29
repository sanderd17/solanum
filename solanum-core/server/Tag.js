import TagSet from './TagSet.js'

class Tag {
    /**
     * @param {TagSet} tagSet
     * @param {string[]} tagPath 
     * @param {{defaultValue: Object}} data 
     */
    constructor(tagSet, tagPath, data) {
        this.tagPath = tagPath
        this.value = data.defaultValue
        this.ts = tagSet
    }

    triggerChange() {
        this.ts.triggerChange(this)
    }

    serialize() {
        return {
            value: this.value,
            tagpath: this.tagPath,
        }
    }

    /**
     * Init function (optional)
     * called when the tag is added to the tagset
     */
    async init() {}

    /**
     * @param {object} value 
     * @returns {void}
     */
    write(value) {
        throw 'Not implemented'
    }
}

export default Tag
