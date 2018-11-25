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
        let child = new template.type(this, this.id + '.' + subId, this.inEditor, template.props)
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
                ts.addTagHandler(path, tag => {this.dom[id][attr] = tag.value})
            } else if (binding.type == 'prop') {
                let key = binding.propName
                this.dom[id][attr] = this.props[key] // apply initial value now
                this.dataBindings[key] = (cmp, val) => cmp.dom[id][attr] = val
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
        cssMap[this.class] = this.css.join('\n')
    return cssMap
}

/**
 * 
 * @param {string} domStr Wrap the current string in a standard SVG element
 */
Template.prototype.SVG = function(domStr) {
    let ns = 'version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'
    domStr =  `<svg ${this.inEditor ? ns : ''}
            id="${this.id}"
            class="${this.class}"
            width="${this.props.width}"
            height="${this.props.height}"
            x="${this.props.x}"
            y="${this.props.y}"
            viewBox="0 0 ${this.size[0]} ${this.size[1]}"
        >` + 
        domStr.replace(braceFinder, (_, key) => this[key]) +
        `</svg>`
    return domStr
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
/** @type Object<string, (cmp:Template, val:any, oldVal:any) => void> */
Template.prototype.dataBindings = {}
Template.prototype.domBindings = {}
Template.prototype.size = [100, 100]
Template.prototype.class = ''
/** @type {Array.<string>} */
Template.prototype.css = []

export default Template
export {EvalTagPath}

