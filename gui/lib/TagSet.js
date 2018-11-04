import messager from './Messager.js'

function TagSet() {
    this.handlers = new Map()
}

TagSet.prototype.initMessageHandlers = function() {
    messager.registerMessageHandler('TagSet:updateTags', (tags) => this.updateTags(tags))
    // refresh all tags when new connection is made
    messager.registerOnopenHandler(() => this.refreshAllTags())
}

TagSet.prototype.refreshAllTags = function(tags) {
    messager.sendMessage({'TagSet:setSubscriptions': [...this.handlers.keys()]})
}

TagSet.prototype.updateTags = function(tags) {
    for (let path in tags) {
        if (this.handlers.has(path)) {
            this.triggerTagBinding(path, tags[path])
        }
    }
}

TagSet.prototype.writeTag = function(path, value) {
    messager.sendMessage({'TagSet:writeTag': {path, value}})
}

TagSet.prototype.addTagHandler = function(path, handler) {
    // Handler to fire functions when a tag change is received
    if (this.handlers.has(path)) {
        this.handlers.get(path).push(handler)
    } else {
        this.handlers.set(path, [handler])
    }
}

TagSet.prototype.triggerTagBinding = function(path, tag) {
    let handlers = this.handlers.get(path)
    for (let handler of handlers) {
        handler(path, tag)
    }
}

// create a singleton to hold all tags
let ts = new TagSet()
export default ts
