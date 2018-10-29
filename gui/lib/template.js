import ts from "./TagSet.js"
const namespace = 'sd:'


function Template() {}


Template.prototype.writeSvg = function(node) {
    node.innerHTML = this.constructor.getSvg(node.id)

    this.createSubTemplates(node)
    this.addHandlers()
    this.addTagBindings()
    this.addDomBindings()
}

Template.prototype.addHandlers = function() {
    let handlers = this.getHandlers()
    for (let h in handlers) {
        let handlerNode = this.getElementById(h)
        for (let handlerType in handlers[h]) {
            handlerNode[handlerType] = handlers[h][handlerType]
        }

    }
}

Template.prototype.addTagBindings = function() {
    let tagBindings = this.getTagBindings()
    for (let attr in tagBindings) {
        let path = this.parent.getAttribute(namespace + attr)
        ts.addTagHandler(path, tagBindings[attr])
    }
}

Template.prototype.addDomBindings = function() {
    let domBindings = this.getDomBindings()
    for (let attr in domBindings) {
        // apply fist setting
        domBindings[attr](this.parent.getAttribute(namespace + attr))
    }
    // Callback function to execute when mutations are observed
    let callback = (mutationsList, observer) => {
        for(let mutation of mutationsList) {
            if (mutation.type != 'attributes' || !mutation.attributeName.startsWith(namespace))
                continue
            let attr = mutation.attributeName.substring(3)
            if (attr in domBindings)
            {
                domBindings[attr](this.parent.getAttribute(mutation.attributeName))
            }
        }
    };

    // Create an observer instance linked to the callback function
    let observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(this.parent, {attributes: true});
}

Template.prototype.createSubTemplates = function(parent) {
    this.parent = parent
    let subTemplates = this.getReplacements()
    for (let s in subTemplates) {
        let childSvg = this.getElementById(s)
        let subTemplate = new subTemplates[s]()

        subTemplate.createSubTemplates(childSvg)
        subTemplate.addHandlers()
        subTemplate.addTagBindings()
        subTemplate.addDomBindings()
    }
}

Template.prototype.getElementById = function(id) {
    return this.parent.getElementById(this.parent.id + '.' + id)
}

Template.prototype.data = {}

Template.prototype.getSvg = function() {return '<rect width="100%" height="100%" background="#FF0000"></rect><text>NOT IMPLEMENTED</text>'}
Template.prototype.getReplacements = () => []
Template.prototype.getHandlers = () => []
Template.prototype.getTagBindings = () => {}
Template.prototype.getDomBindings = () => {}

export default Template

