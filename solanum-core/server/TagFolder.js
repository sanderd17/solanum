import Tag from './Tag.js'

const DELIMITOR = '.'

class TagFolder extends Tag {
    /**
     * 
     * @param {TagSet} tagset 
     * @param {string[]} tagpath 
     * @param {any} tagDescription 
     */
    constructor(tagDescription) {
        super(tagDescription)
        /** @type {Map<string, Tag>} */
        this.children = new Map()
    }

    get size() {
        return this.children.size
    }

    async init(tagSet, tagpath) {
        await super.init(tagSet, tagpath)
        for (let subtagpath in this.data) {
            await this.addTag(subtagpath.split(DELIMITOR), this.data[subtagpath])
        }
    }

    /**
     * 
     * @param {string[]} tagpath 
     * @param {Object} tagDescription 
     */
    async addTag(tagpath, tagDescription) {
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
                        await this.addTag(subtagpath.split(DELIMITOR), tagDescription[subtagpath])
                    }
                }
            } else {
                throw new Error(`Trying to add tag with path "${key}" to folder "${this.tagpath.join('.')}" while tag already existed (${tag})`)
            }
            return
        }

        if (tagpath.length > 0) {
            // Add new tag folder, and recursively add subtags
            let tf = new TagFolder({})
            tf.init(this.ts, this.tagpath.concat([key]))
            tf.addTag(tagpath, tagDescription)
            tag = tf
        } else if (tagDescription instanceof Tag) {
            tag = tagDescription
            await tag.init(this.ts, this.tagpath.concat([key]))
        } else {
            // create tag from type
            /** @type {typeof Tag} */
            let Tagtype = tagDescription.type || TagFolder
            tag = new Tagtype(tagDescription)
            await tag.init(this.ts, this.tagpath.concat([key]))
        }
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