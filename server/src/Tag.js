import ts from './TagSet.js'

class Tag {
    /**
     * @param {string} tagPath 
     * @param {{defaultValue: Object}} data 
     */
    constructor(tagPath, data) {
        this.tagPath = tagPath
        this.value = data.defaultValue
    }
}

Tag.prototype.triggerChange = function() {
    ts.triggerChange(this)
}

/**
 * @param {object} value 
 * @returns {void}
 */
Tag.prototype.write = function(value) {
    throw 'Not implemented'
}



export default Tag
