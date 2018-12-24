import ts from "./TagSet.js"


class Template {
    /**
     * 
     * @param {?Template} parent 
     * @param {string} id 
     * @param {boolean} inEditor Whether this template is loaded to be edited
     * @param {object} props 
     */
    constructor(parent, id, inEditor, props={}) {
        this.parent = parent
        this.isRoot = parent == null
        this.id = id
        this.inEditor = inEditor
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
            },
        })
        this.dom = new Proxy({}, {
            /**
             * get a proxy to the next DOM nodes by id
             * @param {object} obj
             * @param {string} prop 
             */
            get: (obj, prop) => {
                let domObj = this.getElementById(prop)
                if (!domObj)
                    return undefined
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
        let child = new template.type(this, this.id + '-' + subId, this.inEditor, template.props)
        child.createSubTemplates()
        this.children[subId] = child
    }
}

Template.prototype.forEachChild = function(func, recursive) {
    for (let childId in this.children) {
        let child = this.children[childId]
        func(child)
        if (recursive)
            child.forEachChild(func, recursive)
    }
}

Template.prototype.addEventHandlers = function() {
    for (let id in this.eventHandlers) {
        for (let eventType in this.eventHandlers[id]) {
            let fn = this.eventHandlers[id][eventType]
            let handlerNode = this.getElementById(id)
            if (handlerNode) {// TODO warn about missing node
                if (eventType == "load")
                    fn(this, null)
                else
                    handlerNode.addEventListener(eventType, (event) => fn(this, event))
            }
        }
    }
    for (let child of Object.values(this.children)) {
        child.addEventHandlers()
    }
}

const braceFinder = /\{([\w\.]+)\}/g
// TODO certainly test this part of code
/**
 * Replace {-} parts with corresponding prop values
 * @param {string} tagPath 
 * @returns {string} the tagpath with {-} replacements evaluated
 */
const EvalTagPath = function(ctx, tagPath) {
    return tagPath.replace(braceFinder, (_, group) => ctx[group])
}

Template.prototype.addBindings = function() {
    for (let id in this.domBindings) {
        for (let attr in this.domBindings[id]) {
            let binding = this.domBindings[id][attr]
            if (binding.type == 'tag') {
                let path = EvalTagPath(this.props, binding.tagPath)
                let node = this.dom[id]
                if (node) // TODO warn about non-existing binding
                    ts.addTagHandler(path, tag => {this.dom[id][attr] = tag.value})
            } else if (binding.type == 'prop') {
                let key = binding.propName
                let node = this.dom[id]
                if (node) { // TODO warn about missing binding
                    node = this.props[key] // apply initial value now
                    this.dataBindings[key] = (cmp, val) => cmp.dom[id][attr] = val
                }
            }
        }
    }
    for (let child of Object.values(this.children)) {
        child.addBindings()
    }
}

/**
 * 
 * @param {string} id 
 */
Template.prototype.getElementById = function(id) {
    if (id == '') return document.getElementById(this.id)
    return document.getElementById(this.id + '-' + id)
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
        cssMap[this.class] = this.css.join('\n')
    return cssMap
}

/**
 * @param {TemplateStringsArray} rawStrings parts of the template strings
 * @param {string[]} values values to interpolate into the raw strings
 * @return {Document} DOM Document of an SVG element
 */
Template.prototype.svg = function(rawStrings, ...values) {
    // TODO cache parsed dom?
    const parser = new DOMParser()
    let content = String.raw(rawStrings, ...values)

    content = content.replace(braceFinder, (_, key) => key in this.props ? this.props[key] : key)

    const dom = parser.parseFromString(content, 'text/xml')
    const childrenWithId = dom.documentElement.querySelectorAll('[id]')
    for (let child of childrenWithId) {
        child.id = this.id + '-' + child.id
        if (child.nodeName == 'use') {
            // href for recent browsers, xlink:href for editor
            child.setAttribute('href', '#--' + child.id)
            child.setAttribute('xlink:href', '#--' + child.id)
        }
    }
    dom.documentElement.id = this.id
    return dom
}

Template.prototype.render = function(x=100, y=100, width=100, height=100, transform=undefined) {
    return this.svg`<rect x="${x}" y="${y}" width="${width}" height="${height}" background="#FF0000"></rect><text>NOT IMPLEMENTED</text>`
}
/** @typedef {Object} TemplateDescription
 * @property {typeof Template} type
 * @property {any} props
 */
/** @type  {() => Object<string,TemplateDescription>} */
Template.prototype.getReplacements = () => ({})
/** @typedef {(cmp:Template, event:Event) => void} eventHandler */
/** @type {Object<string,Object<string,eventHandler>>} */
Template.prototype.eventHandlers = {}
/** @type Object<string, (cmp:Template, val:any, oldVal:any) => void> */
Template.prototype.dataBindings = {}
Template.prototype.domBindings = {}
Template.prototype.size = [100, 100]
Template.prototype.class = ''
/** @type {Array.<string>} */
Template.prototype.css = []

export default Template
export {EvalTagPath}

