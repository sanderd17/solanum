import Tag from './Tag.js'
import ts from './TagSet.js'

class MemoryTag extends Tag {
    /**
     * @param {string} tagPath 
     * @param {{defaultValue: Object}} data 
     */
    constructor(tagPath, data) {
        super(tagPath, data)
        this.quality = 'GOOD'
    }
}

MemoryTag.prototype.triggerChange = function() {
    ts.triggerChange(this)
}

/**
 * @param {Object} value 
 */
MemoryTag.prototype.write = function(value) {
    this.value = value
    this.triggerChange()
}

/**
 * @param {string} tagPath 
 * @param {{defaultValue: Object}} data 
 */
MemoryTag.createTag = function(tagPath, data) {
    return new MemoryTag(tagPath, data)
}

export default MemoryTag

