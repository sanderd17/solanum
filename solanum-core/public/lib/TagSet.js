import messager from './Messager.js'

/**
 * Singleton class to guide all tag writing and handle triggers
 * @typedef {Object} Tag
 * @property {Object} value
 */

function TagSet() {
    /**
     * @type {Map<Object,Map<string,string>>} Mapping an object with keys to tagpaths 
     */
    this.subscriptions = new Map()
    /**
     * @type {Map<string, Set<Object>>} Reverse lookup: bind tagpath to objects
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
        this.tagCache.set(path, tags[path].value)
        if (!this.subscriptionLookup.has(path))
            continue
        let instanceSet = this.subscriptionLookup.get(path)
        for (let instance of instanceSet) {
            for (let [propName, tagPath] of this.subscriptions.get(instance)) {
                if (tagPath == path) {
                    instance[propName] = tags[path].value
                }
            }
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


TagSet.prototype.setSubscription = function(instance, propName, tagPath) {
    if (!this.subscriptions.has(instance)) {
        this.subscriptions.set(instance, new Map())
    }
    let instanceMap = this.subscriptions.get(instance)
    if (instanceMap.has(propName)) {
        // remove the existing subscription
        this.removeSubscription(instance, propName)
    }

    instanceMap.set(propName, tagPath)

    if (!this.subscriptionLookup.has(tagPath)) {
        this.subscriptionLookup.set(tagPath, new Set())
    }
    this.subscriptionLookup.get(tagPath).add(instance)

    if (this.tagCache.has(tagPath)) {
        return this.tagCache.get(tagPath) // return the value already known
    } 
    if (!this.needsTagRefresh) {
        // Refresh tags after a timeout (to ensure help with batch adding)
        // TODO only refresh new tags
        this.needsTagRefresh = true
        setTimeout(() => this.refreshAllTags())
    }
    return undefined // No value is known yet
}

/**
 * @param {object} instance to remove the subscription from
 * @param {string|null} propName to delete; null to delete all bindings for given instance
 */
TagSet.prototype.removeSubscription = function(instance, propName=null) {
    if (!this.subscriptions.has(instance))
        return

    let instanceMap = this.subscriptions.get(instance)
    if (propName == null) {
        // delete all subscriptions
        for (let tagPath of instanceMap.values()) {
            let instanceSet = this.subscriptionLookup.get(tagPath)
            instanceSet.delete(instance)
        }
        this.subscriptions.delete(instance)
        return
    }
    // delete a single subscription
    if (!instanceMap.has(propName))
        return
    
    let tagPath = instanceMap.get(propName)
    instanceMap.delete(propName)

    // Check if tagpath is still used in other direction, if not, clean it up
    let tpFound = false
    for (let tp of instanceMap.values()) {
        if (tp == tagPath)
            tpFound = true
    }
    // Tagpath no longer used on instance 
    if (!tpFound) {
        this.subscriptionLookup.get(tagPath).delete(instance)
    }
}

// create a singleton to hold all tags
let ts = new TagSet()
export default ts
