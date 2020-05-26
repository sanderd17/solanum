import Tag from './Tag.js'

class MemoryTag extends Tag {

    static parameters = [
        {
            name: "defaultValue",
            description: "The initial value of the tag",
            type: "string"
        }
    ]

    /**
     * @param {{defaultValue: object}} data 
     */
    constructor(data) {
        super(data)
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

