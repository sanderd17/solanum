import ts from "./TagSet.js"

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']
/**
 * @typedef {Object} TemplatePosition
 * @property {number|string=} left 
 * @property {number|string=} right 
 * @property {number|string=} top 
 * @property {number|string=} bottom 
 * @property {number|string=} width 
 * @property {number|string=} height 
 */
/**
 * Template
 */
class Template {
    children = {}

    /**
     * @param {TemplatePosition} position 
     * @param {object} props 
     * @param {object} eventHandlers 
     */
    constructor(position={}, props={}, eventHandlers={}) {
        this.position = position
        this.eventHandlers = eventHandlers


        /** @type Object<string,Template> */
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
                /*if (prop in this.dataBindings) {
                    this.dataBindings[prop](this, val, oldVal)
                }*/
                return true
            },
        })
    }

    setChildren = function(children) {
        this.children = children
        for (let id in this.children)
            this.children[id].setParent(this)
    }

    /**
     * Add a reference to the parent, and store as what id it's referenced
     * @param {Template} parent
     */
    setParent = function(parent) {
        this.parent = parent
    }

    setId = function(id) {
        this.id = id
        this.dom.id = id
        for (let childId in this.children) {
            this.children[childId].setId(id + '.' + childId)
        }
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElement('div')

        for (let key of positionKeys)
            if (key in this.position) this.domNode.style[key] = this.position[key]

        for (let eventType in this.eventHandlers) {
            let fn = this.eventHandlers[eventType]
            if (eventType == "load")
                fn(null)
            else
                this.domNode.addEventListener(eventType, (event) => fn(event))
        }
        for (let child of Object.values(this.children))
            this.domNode.appendChild(child.dom)
        return this.domNode
    } 
}


/*
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
*/

export default Template

