import Tag from './Tag.js'
import ts from './TagSet.js'

class MemoryTag extends Tag {
    /**
     * @param {string} tagPath 
     * @param {{defaultValue: object}} data 
     */
    constructor(tagPath, data) {
        super(tagPath, data)
        this.quality = 'GOOD'
    }
}

/**
 * @param {object} value 
 */
MemoryTag.prototype.write = function(value) {
    this.value = value
    this.triggerChange()
}

export default MemoryTag

