function TagSet() {
    this.guiBindings = new Map()
}

TagSet.prototype.messageHandlers = {
    "TagSet:updateTags": (tags) => {this.updateTags(tags)}
}

TagSet.prototype.updateTags = function(tags) {
    console.log(tags)
    for (let path in tags) {
        if (this.guiBindings.has(path)) {
            this.triggerGuiBinding(path, tags[path])
        }
    }
}

TagSet.prototype.addGuiBinding = function(path, templateInstance) {
    // Append to the bindings for that tag
    if (this.guiBindings.has(path)) {
        this.guiBindings.get(path).push(templateInstance)
    } else {
        this.guiBindings.set(path, [templateInstance])
    }
}

TagSet.prototype.triggerGuiBinding = function(path, tag) {
    let templateInstances = this.guiBindings.get(path)
    for (let inst of templateInstances) {
        inst.triggerTagChanged(path, tag)
    }
}

// create a single instance to hold all tags
let ts = new TagSet()
export default ts
// expose the TagSet prototype to enable extensions
 export { TagSet }
