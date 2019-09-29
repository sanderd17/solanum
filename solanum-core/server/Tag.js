import TagSet from './TagSet.js'

class Tag {
    /**
     * @param {TagSet} tagSet
     * @param {string} tagPath 
     * @param {{defaultValue: Object}} data 
     */
    constructor(tagSet, tagPath, data) {
        this.tagPath = tagPath
        this.value = data.defaultValue
        this.ts = tagSet
    }
}

Tag.prototype.triggerChange = function() {
    this.ts.triggerChange(this)
}

/**
 * @param {object} value 
 * @returns {void}
 */
Tag.prototype.write = function(value) {
    throw 'Not implemented'
}



export default Tag
