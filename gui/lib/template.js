import ts from "./TagSet.js"

function Template() {}


Template.prototype.writeSvg = function(node) {
    node.innerHTML = this.constructor.getSvg(node.id)

    this.createSubTemplates(node)
    this.addHandlers()
    this.addTagBindings()
}

Template.prototype.addHandlers = function() {
    let handlers = this.getHandlers()
    for (let h in handlers) {
        let handlerNode = this.getElementById(h)

        //handlerNode.onclick = eval("() => {" + handlers[h].onclick + "}");
        handlerNode.onclick = handlers[h].onclick
    }
}

Template.prototype.addTagBindings = function() {
    let tagBindings = this.getTagBindings()
    for (let path in tagBindings) {
        ts.addTagHandler(path, (p, t) => this.triggerTagChanged(p, t))
    }
}

Template.prototype.createSubTemplates = function(parent, tmpData=null) {
    this.parent = parent
    this.data = {}
    for (let k in tmpData) {
        if (k[0] == "_")
            continue
        this.parent.dataset[k] = tmpData[k]
        this.data[k] = tmpData[k]
    }
    let subTemplates = this.getReplacements()
    for (let s in subTemplates) {
        let childSvg = this.getElementById(s)
        let tmpData = subTemplates[s]
        let subTemplate = new tmpData._type()

        subTemplate.createSubTemplates(childSvg, tmpData)
        subTemplate.addHandlers()
        subTemplate.addTagBindings()
    }
}

Template.prototype.getElementById = function(id) {
    return this.parent.getElementById(this.parent.id + '.' + id)
}

Template.prototype.triggerTagChanged = function(path, tag) {
    let tagBindings = this.getTagBindings()
    for (let b of tagBindings[path]) {
        let triggeredElement  = this.getElementById(b.element)
        triggeredElement.setAttribute(b.attribute, b.binding(tag))
    }
}

Template.prototype.data = {}

Template.prototype.getSvg = function() {return '<rect width="100%" height="100%" background="#FF0000"></rect><text>NOT IMPLEMENTED</text>'}
Template.prototype.getReplacements = () => []
Template.prototype.getHandlers = () => []
Template.prototype.tagBindings = {}

export default Template

