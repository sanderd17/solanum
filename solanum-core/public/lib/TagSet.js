import messager from './Messager.js'

/**
 * Singleton class to guide all tag writing and handle triggers
 * @typedef {Object} Tag
 * @property {Object} value
 */

function TagSet() {
    this.handlers = new Map()
    this.needsTagRefresh = true
}

/**
 * Register some messages over the WebSocket
 */
TagSet.prototype.initMessageHandlers = function() {
    messager.registerMessageHandler('TagSet:updateTags', this.updateTags.bind(this))
    // refresh all tags when new connection is made
    messager.registerOnopenHandler(() => this.refreshAllTags())
}

/**
 * Reset the subscriptions to get updated values of all tags back
 */
TagSet.prototype.refreshAllTags = function() {
    messager.sendMessage({'TagSet:setSubscriptions': [...this.handlers.keys()]})
    this.needsTagRefresh = false
}

/**
 * Handle updated tags received from the server: execute all triggers
 * @param {Object<string,Tag>} tags 
 */
TagSet.prototype.updateTags = function(tags) {
    for (let path in tags) {
        if (this.handlers.has(path)) {
            this.triggerTagBinding(path, tags[path])
        }
    }
}

/**
 * Write to a tag on the server
 * @param {string} path 
 * @param {Object} value 
 */
TagSet.prototype.writeTag = function(path, value) {
    messager.sendMessage({'TagSet:writeTag': {path, value}})
}

/**
 * 
 * @param {string} path 
 * @param {Function} handler 
 */
TagSet.prototype.addTagHandler = function(path, handler) {
    // Handler to fire functions when a tag change is received
    if (this.handlers.has(path)) {
        this.handlers.get(path).push(handler)
    } else {
        this.handlers.set(path, [handler])
    }
    if (!this.needsTagRefresh) {
        this.needsTagRefresh = true
        setTimeout(() => this.refreshAllTags())
    }
}

/**
 * 
 * @param {string} path 
 * @param {Tag} tag 
 */
TagSet.prototype.triggerTagBinding = function(path, tag) {
    let handlers = this.handlers.get(path)
    for (let handler of handlers) {
        handler(tag)
    }
}

// create a singleton to hold all tags
let ts = new TagSet()
export default ts
