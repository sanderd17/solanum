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

    /**
     * @type {Map<string,Set<{resolve: function, reject: function}>>}
     */
    this.tagsToRead = new Map()

    this.tagCache = new Map()
    this.needsTagRead = false
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

TagSet.prototype.readTag = function(path) {
    let p = new Promise((resolve, reject) => {
        if (!this.tagsToRead.has(path)) {
            this.tagsToRead.set(path, new Set())
        }
        this.tagsToRead.get(path).add({resolve, reject})
        if (!this.needsTagRead) {
            this.needsTagRead = true
            setTimeout(() => this.readRequestedTags())
        }
    })
    return p
}

/**
 * Group all tag requests into one HTTP fetch
 */
TagSet.prototype.readRequestedTags = async function() {
    // clone tagsToRead to use it in this async context, this function can be called again for other tags while the fetch is running
    let tagsToRead = this.tagsToRead
    this.tagsToRead = new Map()
    this.needsTagRead = false

    let tagpaths = [...tagsToRead.keys()]

    try {
        let response = await fetch("/API/TagSet/readTags", {
            method: 'POST',
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(tagpaths)
        })
        let apiResult = await response.json()
        // resolve all tag requests to their values
        for (let [tagpath, set] of tagsToRead.entries()) {
            let value = apiResult[tagpath]
            for (let obj of set) {
                obj.resolve(value)
            }
        }
    } catch (e) {
        for (let set of tagsToRead.values()) {
            for (let obj of set) {
                obj.reject(e)
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

/**
 * @param {Prop} componentProp
 * @param {string} tagPath
 */
TagSet.prototype.addPropSubscription = function(componentProp, tagPath) {
    if (!this.subscriptionLookup.has(tagPath)) {
        this.subscriptionLookup.set(tagPath, new Set())
    }
    this.subscriptionLookup.get(tagPath).add(componentProp)
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
