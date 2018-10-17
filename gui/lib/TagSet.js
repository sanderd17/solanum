function TagSet() {
    this.handlers = new Map()
}

TagSet.prototype.getMessageHandlers = function() {
    return {
        "TagSet:updateTags": (tags) => {this.updateTags(tags)}
    }
}

TagSet.prototype.updateTags = function(tags) {
    for (let path in tags) {
        if (this.handlers.has(path)) {
            this.triggerTagBinding(path, tags[path])
        }
    }
}

TagSet.prototype.addTagHandler = function(path, handler) {
    // Append to the bindings for that tag
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
