import ts from "./TagSet.js"

function Template() {}

Template.prototype.init = function(parent, id, data, loc) {
    this.parent = parent
    this.id = id
    this.data = data
    this.loc = loc
    this.dataBindings = {}
    this.createSubTemplates()
}

Template.prototype.createSubTemplates = function() {
    this.children = {}
    let subTemplates = this.getReplacements()
    for (let [subId, template] of Object.entries(subTemplates)) {
        let child = new template.type()
        child.init(this, this.id + '.' + subId, template.data, template.loc)
        this.children[subId] = child
    }
}

Template.prototype.forEach = function(fn) {
    // call function on self:
    fn(this)
    for (let child of Object.values(this.children)) {
        child.forEach(fn)
    }
}

Template.prototype.addEventHandlers = function(id, eventType, fn) {
    for (let id in this.eventHandlers) {
        for (let eventType in this.eventHandlers[id]) {
            let fn = this.eventHandlers[id][eventType]
            let handlerNode = this.getElementById(id)
            handlerNode[eventType] = fn.bind(this)
        }
    }
}

Template.prototype.addTagBindings = function() {
    for (let [path, fn] of this.tagBindings) {
        if (path instanceof Function)
            path = path.bind(this)()
        ts.addTagHandler(path, fn.bind(this))
    }
}

Template.prototype.addDataBindings = function() {
    for (let key in this.dataBindings) {
        this.dataBindings[key] = this.dataBindings[key].bind(this)
        this.dataBindings[key](this.data[key], null)
    }
}

Template.prototype.setAttr = function(key, value) {
    let oldValue = this.data[key]
    this.data[key] = value
    // call modification
    if (key in this.dataBindings) {
        this.dataBindings[key](value, oldValue)
    }
}

Template.prototype.getAttr = function(key) {
    return this.data[key]
}

Template.prototype.getElementById = function(id) {
    return document.getElementById(this.id + '.' + id)
}

Template.prototype.getSvg = function() {return '<rect width="100%" height="100%" background="#FF0000"></rect><text>NOT IMPLEMENTED</text>'}
Template.prototype.getReplacements = () => []
Template.prototype.eventHandlers = {}
Template.prototype.tagBindings = []
Template.prototype.dataBindings = {}

export default Template

