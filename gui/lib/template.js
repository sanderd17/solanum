import ts from "./TagSet.js"

class Template {}

Template.prototype.parent
Template.prototype.id
Template.prototype.data
Template.prototype.dom
Template.prototype.loc
Template.prototype.children

Template.prototype.init = function(parent, id, data, loc) {
    this.parent = parent
    this.id = id
    this.data = new Proxy(data, {
        /**
         * @arg {Object} obj
         * @arg {string} prop
         */
        get: (obj, prop) => obj[prop],
        /**
         * @arg {Object} obj
         * @arg {string} prop
         * @arg {Object} val
         */
        set: (obj, prop, val) => {
            let oldVal = obj[prop]
            obj[prop] = val
            if (prop in this.dataBindings) {
                this.dataBindings[prop].bind(this)(val, oldVal)
            }
            return true
        }
    })
    this.loc = loc
    this.dom = new Proxy({}, {
        // get a proxy to the next DOM nodes by id
        get: (obj, prop) => {
            let domObj = this.getElementById(prop)
            // get a proxy to the DOM attributes
            return new Proxy(domObj, {
                /**
                 * @arg {Object} obj
                 * @arg {string} prop
                 */
                get: (obj, prop) => domObj.getAttribute(prop),
                /**
                 * @arg {Object} obj
                 * @arg {string} prop
                 * @arg {Object} val
                 */
                set: (obj, prop, val) => {
                    domObj.setAttribute(prop, val)
                    return true
                },
            })
        }
    })
    this.children = {}
    this.createSubTemplates()
}

Template.prototype.createSubTemplates = function() {
    let subTemplates = this.getReplacements()
    for (let [subId, template] of Object.entries(subTemplates)) {
        let child = new template.type()
        child.init(this, this.id + '.' + subId, template.data, template.loc)
        this.children[subId] = child
    }
}

Template.prototype.addEventHandlers = function(id, eventType, fn) {
    for (let id in this.eventHandlers) {
        for (let eventType in this.eventHandlers[id]) {
            let fn = this.eventHandlers[id][eventType]
            let handlerNode = this.getElementById(id)
            handlerNode.addEventListener(eventType, fn.bind(this))
        }
    }
    for (let child of Object.values(this.children)) {
        child.addEventHandlers()
    }
}

Template.prototype.addTagBindings = function() {
    for (let [path, fn] of this.tagBindings) {
        if (path instanceof Function)
            path = path.bind(this)()
        ts.addTagHandler(path, fn.bind(this))
    }
    for (let child of Object.values(this.children)) {
        child.addTagBindings()
    }
}

Template.prototype.addDataBindings = function() {
    for (let key in this.dataBindings) {
        this.dataBindings[key].bind(this)(this.data[key], null)
    }
    for (let child of Object.values(this.children)) {
        child.addDataBindings()
    }
}

Template.prototype.getElementById = function(id) {
    return document.getElementById(this.id + '.' + id)
}

Template.prototype.getCssMap = function() {
    let cssMap = {}
    for (let child of Object.values(this.children)) {
        if (cssMap[child.class])
            continue
        cssMap = {...child.getCssMap(), ...cssMap}
    }
    if (this.class && this.css)
        cssMap[this.class] = this.css.map(rule => '.' + this.class + ' > ' + rule).join('\n')
    return cssMap
}

Template.prototype.getSvg = function() {return '<rect width="100%" height="100%" background="#FF0000"></rect><text>NOT IMPLEMENTED</text>'}
Template.prototype.getReplacements = () => ({})
Template.prototype.eventHandlers = {}
Template.prototype.tagBindings = []
Template.prototype.dataBindings = {}
Template.prototype.class = ''
Template.prototype.css = []

export default Template

