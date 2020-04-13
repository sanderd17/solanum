import Tag from './Tag.js'

const DELIMITOR = '.'

class TagFolder extends Tag {
    /**
     * 
     * @param {TagSet} tagset 
     * @param {string[]} tagpath 
     * @param {any} tagDescription 
     */
    constructor(tagset, tagpath, tagDescription) {
        super(tagset, tagpath, tagDescription)
        /** @type {Map<string, Tag>} */
        this.children = new Map()

        for (let subtagpath in tagDescription) {
            this.addTag(subtagpath.split(DELIMITOR), tagDescription[subtagpath])
        }
    }

    get size() {
        return this.children.size
    }

    /**
     * 
     * @param {string[]} tagpath 
     * @param {Object} tagDescription 
     */
    addTag(tagpath, tagDescription) {
        if (typeof tagDescription != "object") {
            throw new Error(`Cannot set ${tagDescription} as tag description`)
        }

        let key
        [key, ...tagpath] = tagpath // clone tagpath to not alter the array

        let tag = this.children.get(key)
        if (tag) {
            if (tag instanceof TagFolder) {
                if (tagpath.length > 0) {
                    tag.addTag(tagpath, tagDescription)
                } else {
                    // Loop over description to add possible subtags
                    for (let subtagpath in tagDescription) {
                        this.addTag(subtagpath.split(DELIMITOR), tagDescription[subtagpath])
                    }
                }
            } else {
                throw new Error(`Trying to add tag with path "${key}" to folder "${this.tagpath.join('.')}" while tag already existed (${tag})`)
            }
            return
        }

        if (tagpath.length > 0) {
            // Add new tag folder, and recursively add subtags
            let tf = new TagFolder(this.ts, this.tagpath.concat([key]), {})
            tf.addTag(tagpath, tagDescription)
            tag = tf
        } else {
            // create tag from type
            /** @type {typeof Tag} */
            let Tagtype = tagDescription.type || TagFolder
            tag = new Tagtype(this.ts, this.tagpath.concat([key]), tagDescription)
        }
        tag.init()
        this.children.set(key, tag)
    }

    /**
     * 
     * @param {string[]} tagpath
     * @returns {Tag|undefined} 
     */
    getTag(tagpath) {
        if (tagpath.length == 0) {
            return this
        }
        let key
        [key, ...tagpath] = tagpath // clone tagpath to not alter the object
        let child = this.children.get(key)
        if (!child) {
            return undefined
        }
        return child.getTag(tagpath)
    }


    /**
     * @param {string[]} tagpath 
     */
    deleteTag(tagpath) {
        // TODO implement
    }
}

export default TagFolder