import clientList from './ClientList.js'
import ClientConnection from './ClientConnection.js'
import Tag from './Tag.js'

/**
 * @typedef {object} TagDescription
 * @property {typeof Tag} type
 * @property {any} defaultValue
 */

function TagSet(config) {
    // TODO load tags list from config instead of hard coding
    this.activeSendTimer = null
    this.changedTags = new Set()
    /** @type {Map<string, Tag>} */
    this.tags = new Map()
    this.subscribedTags = new WeakMap()// link clients to their subscribed tags
}

TagSet.prototype.initMessageHandlers = function () {
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
            this.subscribedTags.set(client, subscriptionList)

            let tags = new Set(subscriptionList)
            this.sendTags(new Set([client]), tags)
        }
    )
    ClientConnection.on(
        'TagSet:writeTag',
        /**
         * @param {ClientConnection} client
         * @param {{path: string, value: object}} data
         */
        (client, data) => {
            let tag = this.tags.get(data.path)
            tag.write(data.value)
        }
    )
}

/**
 * @param {object} tagList 
 */
TagSet.prototype.setTags = function (tagList) {
    for (let tagpath in tagList) {
        this.addTag(tagpath, tagList[tagpath])
    }
}

/**
 * 
 * @param {string} tagpath 
 * @param {TagDescription} tagDescr 
 */
TagSet.prototype.addTag = function (tagpath, tagDescr) {
    let tagType = tagDescr.type
    this.tags.set(tagpath, new tagType(this, tagpath, tagDescr))
}

/**
 * @param {Tag} tag 
 */
TagSet.prototype.triggerChange = function (tag) {
    this.changedTags.add(tag.tagPath)
    if (!this.activeSendTimer) {
        // notify clients at the end of the eval loop
        this.activeSendTimer = setTimeout(() => this.sendTags(), 0)
    }
}

/**
 * 
 * @param {Set<ClientConnection>} clients 
 * @param {Set<string>} tagPaths 
 */
TagSet.prototype.sendTags = function (clients = clientList, tagPaths = null) {
    let specificPaths = tagPaths || this.changedTags // default to changed tags
    this.activeSendTimer = 0
    /** @type {Object<string,{value: any}>} */
    let tagsToSend = {}
    for (let path of specificPaths) {
        let tag = this.tags.get(path)
        tagsToSend[path] = { "value": tag ? tag.value : null }
    }
    for (let client of clients) {
        client.sendMessage({ 'TagSet:updateTags': tagsToSend })//.then(() => {})
    }
    if (!tagPaths)
        this.changedTags.clear()
}

// Should only be instanced by the main Solanum class
export default TagSet

