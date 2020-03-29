import clientList from './ClientList.js'
import ClientConnection from './ClientConnection.js'
import Tag from './Tag.js'

/**
 * @typedef {object} TagDescription
 * @property {typeof Tag} type
 * @property {any} defaultValue
 */

class TagFolder {
    constructor() {
        /** @type {Map<string, Tag|TagFolder>} */
        this.children = new Map()
    }

    get size() {
        return this.children.size
    }

    /**
     * 
     * @param {string[]} tagPath 
     * @param {Tag} tag 
     */
    addTag(tagPath, tag) {
        let key
        [key, ...tagPath] = tagPath
        let child = this.children.get(key)
        if (!child) {
            // create a new tag or folder
            if (tagPath.length > 0) {
                let newFolder = new TagFolder()
                newFolder.addTag(tagPath, tag)
                this.children.set(key, newFolder)
            } else {
                this.children.set(key, tag)
            }
            return
        }
        
        if (tagPath.length == 0) {
            // leaf node found, can't replace a tag, should be deleted first
            throw new Error("Asked to add a tag with a tagpath that already exists")
        }

        if (child instanceof Tag) {
            throw new Error("Asked to add a tag as subtag of another tag")
        }
        child.addTag(tagPath, tag)
    }

    /**
     * 
     * @param {string[]} tagpath
     * @returns {Tag|undefined} 
     */
    getTag(tagpath) {
        let key = tagpath.shift()
        let child = this.children.get(key)
        if (!child)
            return undefined // tag not found

        if (!(child instanceof TagFolder)) {
            if (tagpath.length == 0) {
                // leaf node found, should be a tag
                return child
            }
            throw new Error("Tag was not the leaf of the given tagpath")
        }

        return child.getTag(tagpath)
    }

    /**
     * @param {string[]} tagPath 
     */
    hasTag(tagPath) {
        return this.getTag(tagPath) != undefined
    }

    /**
     * @param {string[]} tagPath 
     */
    deleteTag(tagPath) {
        // TODO implement
    }
}


class TagSet {

    /**
     * @param {import('express').Application} app The express application
     * @param {*} config  The full config file
     */
    constructor(app, config) {
        this.activeSendTimer = null
        this.changedTags = new Set()
        this.root = new TagFolder()
        /** @type {WeakMap<ClientConnection, Set<string|string[]>>} */
        this.subscribedTags = new WeakMap()// link clients to their subscribed tags
    }

    initMessageHandlers() {
        // Let clients set their subscribed tags
        ClientConnection.on(
            'TagSet:setSubscriptions',
            /**
             * On subscription, store the subscribed tags,
             * and resend all tags now subscribed to
             * @param {ClientConnection} client
             * @param {string[]} subscriptionList
             */
            (client, subscriptionList) => {
                this.subscribedTags.set(client, new Set(subscriptionList))
                this.sendTagsToClient(client, subscriptionList)
            }
        )
        ClientConnection.on(
            'TagSet:writeTag',
            /**
             * @param {ClientConnection} client
             * @param {{path: string, value: object}} data
             */
            (client, data) => {
                let tag = this.getTag(data.path)
                if (!tag) {
                    console.error(`Could not find tag with path ${data.path}`)
                    return
                }
                tag.write(data.value)
            }
        )
    }

    /**
     * @param {object} tagDefinitions
     * @param {Array<string>} prefix
     */
    setTags(tagDefinitions, prefix=[]) {
        if (typeof tagDefinitions != 'object')
            throw new Error(`Expected an object as tag definition, but got << ${tagDefinitions} >>`)
            
        for (let tagpath in tagDefinitions) {
            let tagDefinition = tagDefinitions[tagpath]
            if (tagDefinition.type && typeof tagDefinition.type == 'function') {
                // a final tag
                this.addTag(prefix.concat(tagpath.split('.')), tagDefinition)
            } else {
                // a collection of tags
                this.setTags(tagDefinition, prefix.concat(tagpath.split('.')))
            }
        }
    }

    /**
     * @param {string|string[]} tagpath 
     * @param {TagDescription} tagDescr 
     */
    addTag(tagpath, tagDescr) {
        if (typeof tagpath == 'string') {
            tagpath = tagpath.split('.')
        }
        let tagType = tagDescr.type
        let tag = new tagType(this, tagpath, tagDescr)
        tag.init()
        this.root.addTag(tagpath, tag)
    }

    /**
     * @param {string|string[]} tagpath 
     */
    getTag(tagpath) {
        if (typeof tagpath == 'string') {
            tagpath = tagpath.split('.')
        }
        return this.root.getTag(tagpath)
    }

    /**
     * @param {Tag} tag 
     */
    triggerChange(tag) {
        console.log('TAGPATH', tag.tagPath)
        this.changedTags.add(tag.tagPath.join('.'))
        if (!this.activeSendTimer) {
            // notify clients at the end of the eval loop
            this.activeSendTimer = setTimeout(() => this.sendChangedTags(), 0)
        }
    }
    
    /**
     * @param {string[]} tagpaths 
     */
    getSerializedTags(tagpaths) {
        let ret = {}
        for (let path of tagpaths) {
            let tag = this.getTag(path)
            ret[path] = tag ? tag.serialize() : null
        }
        return ret
    }

    /**
     * Send all changed tags to all listening clients
     */
    sendChangedTags() {
        this.activeSendTimer = 0
        for (let client of clientList) {
            // TODO filter on subscribed tags
            this.sendTagsToClient(client, [...this.changedTags])
        }
        this.changedTags.clear()
    }

    /**
     * @param {ClientConnection} client 
     * @param {string[]} tagpaths
     */
    sendTagsToClient(client, tagpaths) {
        let serializedTags = this.getSerializedTags(tagpaths)
        client.sendMessage({'TagSet:updateTags': serializedTags})//.then(() => {}) // TODO disconnect on failure > client will automatically reconnect and query all tags again
    }
}

// Should only be instanced by the main Solanum class
export default TagSet

