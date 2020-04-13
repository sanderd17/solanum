import messager from './Messager.js'

/** @typedef { import('./ComponentProp').default } Prop */

/**
 * Singleton class to guide all tag writing and handle triggers
 * @typedef {Object} Tag
 * @property {Object} value
 */
function TagSet() {
    /**
     * @type {Map<string, Set<Prop>>} Reverse lookup: bind tagpath to objects
     */
    this.subscriptionLookup = new Map()

    this.tagCache = new Map()
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
    messager.sendMessage({'TagSet:setSubscriptions': [...this.subscriptionLookup.keys()]})
    this.needsTagRefresh = false
}

/**
 * Handle updated tags received from the server: execute all triggers
 * @param {Object<string,Tag>} tags 
 */
TagSet.prototype.updateTags = function(tags) {
    for (let path in tags) {
        if (!tags[path])
            continue
        this.tagCache.set(path, tags[path].value)
        if (!this.subscriptionLookup.has(path))
            continue
        for (let prop of this.subscriptionLookup.get(path)) {
            prop.recalcValue()
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
 * @param {Prop} componentProp
 * @param {string} tagPath
 */
TagSet.prototype.addPropSubscription = function(componentProp, tagPath) {
    if (!this.subscriptionLookup.has(tagPath)) {
        this.subscriptionLookup.set(tagPath, new Set())
    }
    this.subscriptionLookup.get(tagPath).add(componentProp)

    if (this.tagCache.has(tagPath))
        return

    if (!this.needsTagRefresh) {
        // Refresh tags after a timeout (to ensure help with batch adding)
        // TODO only refresh new tags
        this.needsTagRefresh = true
        setTimeout(() => this.refreshAllTags())
    }
}

TagSet.prototype.getCachedTagValue = function(tagPath) {
    if (this.tagCache.has(tagPath))
        return this.tagCache.get(tagPath)
    return undefined
}

/**
 * @param {Prop} componentProp
 * @param {string} tagPath
 */
TagSet.prototype.removePropSubscription = function(componentProp, tagPath) {
    if (!this.subscriptionLookup.has(tagPath)) {
        console.error(`Cannot remove tagpath ${tagPath} from tag subscriptions. Was it already removed?`)
        return
    }

    let subscribedElements = this.subscriptionLookup.get(tagPath)
    subscribedElements.delete(componentProp)
    //TODO notify server?
}

// create a singleton to hold all tags
let ts = new TagSet()
export default ts
