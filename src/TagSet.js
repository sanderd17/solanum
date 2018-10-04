import tags from '../tags/default.js'
import clientList from './ClientList.js'

function TagSet () {
    this.activeSendTimer = 0
    this.changedTags = new Set()
    this.tags = new Map()
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
    this.changedTags.add(tag)
    if (!this.activeSendTimer) {
        // notify clients at the end of the eval loop
        this.activeSendTimer = setTimeout(() => this.sendChangedTags(), 0)
    }
}

TagSet.prototype.sendChangedTags = function(clients=clientList) {
    this.activeSendTimer = 0
    let tagsToSend = {}
    for (let tag of this.changedTags) {
        tagsToSend[tag.tagPath] = {"value": tag.value}
    }
    for (let client of clients) {
        client.sendMessage({'TagSet:updateTags': tagsToSend})//.then(() => {})
    }
    this.changedTags.clear()
}

let ts = new TagSet()

export default ts

