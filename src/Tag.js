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





export default Tag
