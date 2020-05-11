import clientList from './ClientList.js'
import ClientConnection from './ClientConnection.js'
import TagFolder from './TagFolder.js'
import Tag from './Tag.js'

/**
 * @typedef {object} TagDescription
 * @property {typeof Tag} type
 * @property {any} defaultValue
 */

class TagSet {

    /**
     * @param {import('express').Application} app The express application
     * @param {*} config  The full config file
     */
    constructor(app, config) {
        this.activeSendTimer = null
        this.changedTags = new Set()
        this.root = new TagFolder({})
        this.root.init(this, [])
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
     * @param {string} setName
     * @param {string} fileName
     */
    async setTags(setName, fileName) {
        console.log(fileName)
        let tagFile = await import(fileName)
        console.log("Tag definitions: ", tagFile)
        await this.root.addTag([setName], tagFile.default)
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
        this.changedTags.add(tag.tagpath.join('.'))
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

