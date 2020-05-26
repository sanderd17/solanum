class Tag {
    /**
     * Description of the parameters passed on to the construction
     * @type {{name: string, description: string, type: string}[]}
     */
    static parameters = []

    /**
     * @param {any} data 
     */
    constructor(data) {
        this.data = data
    }
    
    /**
     * Init function (optional)
     * called when the tag is added to the tagset
     * @param {TagSet} tagSet
     * @param {string[]} tagpath
     */
    async init(tagSet, tagpath) {
        this.ts = tagSet
        this.tagpath = tagpath
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
     * @param {object} value 
     * @returns {void}
     */
    write(value) {
        throw new Error('Not implemented')
    }
}

export default Tag
