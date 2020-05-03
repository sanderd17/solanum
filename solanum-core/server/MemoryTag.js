import Tag from './Tag.js'

class MemoryTag extends Tag {
    /**
     * @param {TagSet} tagSet
     * @param {string} tagPath 
     * @param {{defaultValue: object}} data 
     */
    constructor(tagSet, tagPath, data) {
        super(tagSet, tagPath, data)
        this.quality = 'GOOD'
        this.value = data.defaultValue
    }

    serialize() {
        return {
            value: this.value,
            quality: this.quality,
            tagpath: this.tagpath,
        }
    }

    /**
     * @param {object} value 
     */
    write(value) {
        this.value = value
        this.triggerChange()
    }
}


export default MemoryTag

