import ts from "./TagSet.js"

class Template {
    /**
     * 
     * @param {?Template} parent 
     * @param {string} id 
     * @param {object} props 
     */
    constructor(parent, id, props={}) {
        this.parent = parent
        this.id = id
        /** @type Object<string,Template> */
        this.children = {}
        this.props = new Proxy(props, {
            /**
             * @arg {object} obj
             * @arg {string} prop
             */
            get: (obj, prop) => obj[prop],
            /**
             * @arg {object} obj
             * @arg {string} prop
             * @arg {object} val
             */
            set: (obj, prop, val) => {
                /** @type {any} */
                let oldVal = obj[prop]
                obj[prop] = val
                if (prop in this.dataBindings) {
                    this.dataBindings[prop](this, val, oldVal)
                }
                return true
            }
        })
        this.dom = new Proxy({}, {
            /**
             * get a proxy to the next DOM nodes by id
             * @param {object} obj
             * @param {string} prop 
             */
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
    }
}

Template.prototype.createSubTemplates = function() {
    let subTemplates = this.getReplacements()
    for (let [subId, template] of Object.entries(subTemplates)) {
        let child = new template.type(this, this.id + '.' + subId, template.props)
        child.createSubTemplates()
        this.children[subId] = child
    }
}

Template.prototype.addEventHandlers = function() {
    for (let id in this.eventHandlers) {
        for (let eventType in this.eventHandlers[id]) {
            let fn = this.eventHandlers[id][eventType]
            let handlerNode = this.getElementById(id)
            handlerNode.addEventListener(eventType, (event) => fn(this, event))
        }
    }
    for (let child of Object.values(this.children)) {
        child.addEventHandlers()
    }
}

Template.prototype.addTagBindings = function() {
    for (let [path, fn] of this.tagBindings) {
        if (path instanceof Function)
            path = path(this)
        ts.addTagHandler(path, (path, tag) => fn(this, path, tag))
    }
    for (let child of Object.values(this.children)) {
        child.addTagBindings()
    }
}

Template.prototype.addDataBindings = function() {
    for (let key in this.dataBindings) {
        this.dataBindings[key](this, this.props[key], null)
    }
    for (let child of Object.values(this.children)) {
        child.addDataBindings()
    }
}

/**
 * 
 * @param {string} id 
 */
Template.prototype.getElementById = function(id) {
    return document.getElementById(this.id + '.' + id)
}

/**
 * @returns {Object<string, string>}
 */
Template.prototype.getCssMap = function() {
    /** @type {Object<string, string>} */
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

Template.prototype.render = function() {return '<rect width="100%" height="100%" background="#FF0000"></rect><text>NOT IMPLEMENTED</text>'}
/** @typedef {Object} TemplateDescription
 * @property {typeof Template} type
 * @property {any} props
 */
/** @type  {() => Object<string,TemplateDescription>} */
Template.prototype.getReplacements = () => ({})
/** @typedef {(cmp:Template, event:Event) => void} eventHandler */
/** @type {Object<string,Object<string,eventHandler>>} */
Template.prototype.eventHandlers = {}
/** @type {Array.<Array>} */
Template.prototype.tagBindings = []
/** @type Object<string, (val:any, oldVal:any) => void> */
Template.prototype.dataBindings = {}
Template.prototype.class = ''
/** @type {Array.<string>} */
Template.prototype.css = []

export default Template

