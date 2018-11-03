import ts from "./TagSet.js"

function Template() {}

Template.prototype.init = function(parent, id, data, loc) {
    this.parent = parent
    this.id = id
    this.data = data
    this.loc = loc
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

Template.prototype.addTagBindings = function() {
    let tagBindings = this.getTagBindings()
    for (let attr in tagBindings) {
        let path = this.data[attr]
        ts.addTagHandler(path, tagBindings[attr])
    }
    for (let child of Object.values(this.children)) {
        child.addTagBindings()
    }
}

Template.prototype.addDataBindings = function() {
    this.dataBindings = this.getDataBindings()
    for (let attr in this.dataBindings) {
        // apply fist setting
        this.dataBindings[attr](this.data[attr], null)
    }
    for (let child of Object.values(this.children)) {
        child.addDataBindings()
    }
}

Template.prototype.addEventHandlers = function() {
    let handlers = this.getEventHandlers()
    for (let h in handlers) {
        let handlerNode = this.getElementById(h)
        for (let handlerType in handlers[h]) {
            handlerNode[handlerType] = handlers[h][handlerType]
        }
    }
    for (let child of Object.values(this.children)) {
        child.addEventHandlers()
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
Template.prototype.getEventHandlers = () => []
Template.prototype.getTagBindings = () => {}
Template.prototype.getDataBindings = () => {}

export default Template

