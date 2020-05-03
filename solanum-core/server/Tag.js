class Tag {
    /**
     * @param {TagSet} tagSet
     * @param {string[]} tagpath 
     * @param {any} data 
     */
    constructor(tagSet, tagpath, data) {
        this.tagpath = tagpath
        this.data = data
        this.ts = tagSet
    }

    triggerChange() {
        this.ts.triggerChange(this)
    }

    serialize() {
        return {
            data: this.data,
            tagpath: this.tagpath,
        }
    }

    /**
     * @param {string[]} tagpath The relative path starting from this tag
     * @returns {Tag} 
     */
    getTag(tagpath) {
        if (tagpath.length == 0)
            return this
    }

    /**
     * @param {string[]} tagpath The relative path starting from this tag
     */
    hasTag(tagpath) {
        return this.getTag(tagpath) != undefined
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
        throw new Error('Not implemented')
    }
}

export default Tag
