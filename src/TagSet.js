import tags from '../tags/default.js'
import clientList from './ClientList.js'
import Client from './Client.js'

function TagSet () {
    this.activeSendTimer = 0
    this.changedTags = new Set()
    this.tags = new Map()
    this.subscribedTags = new WeakMap()// link clients to their subscribed tags
}

TagSet.prototype.initMessageHandlers = function() {
    // Let clients set their subscribed tags
    Client.addMessageHandler(
        'TagSet:setSubscriptions',
        // on subscription, store the subscribed tags,
        // and resend all tags now subscribed to
        (client, subscriptionList) => {
            this.subscribedTags.set(client, subscriptionList)

            let tags = new Set(subscriptionList)
            this.sendTags([client], tags)
        }
    )
    Client.addMessageHandler(
        'TagSet:writeTag',
        (client, data) => {
            let tag = this.tags.get(data.path)
            tag.write(data.value)
        }
    )
}

TagSet.prototype.setTags = function(tagList=tags) {
    for (let tagpath in tagList) {
        this.addTag(tagpath, tagList[tagpath])
    }
}

TagSet.prototype.addTag = function(tagpath, tagDescr) {
    let type = tagDescr.type
    this.tags.set(tagpath, new type(tagpath, tagDescr))
}

TagSet.prototype.triggerChange = function(tag) {
    this.changedTags.add(tag.tagPath)
    if (!this.activeSendTimer) {
        // notify clients at the end of the eval loop
        this.activeSendTimer = setTimeout(() => this.sendTags(), 0)
    }
}

TagSet.prototype.sendTags = function(clients=clientList, tagPaths=null) {
    let specificPaths = tagPaths || this.changedTags // default to changed tags
    this.activeSendTimer = 0
    let tagsToSend = {}
    for (let path of specificPaths) {
        let tag = this.tags.get(path)
        tagsToSend[path] = {"value": tag ? tag.value : null}
    }
    for (let client of clients) {
        client.sendMessage({'TagSet:updateTags': tagsToSend})//.then(() => {})
    }
    if (!tagPaths)
        this.changedTags.clear()
}

let ts = new TagSet()

export default ts

