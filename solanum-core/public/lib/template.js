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
 * 
 */
class Template {
    /**
     * @param {TemplatePosition} position description
     * @param {object} props 
     */
    constructor(position={}, props={}) {
        this.position = position

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
            this.children[id].setParentInfo(this, id)
    }

    /**
     * Add a reference to the parent, and store as what id it's referenced
     * @param {Template} parent
     * @param {string} id
     */
    setParentInfo = function(parent, id) {
        this.parent = parent
        this.id = id
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElement('div')

        let id = this.id
        if (this.parent != null)
            id = this.setParentInfo.id + '.' + id
        this.domNode.id = id
        for (let key of positionKeys)
            if (key in this.position) this.domNode.style[key] = this.position[key]
        for (let child of Object.values(this.children))
            this.domNode.appendChild(child.dom)
        return this.domNode
    } 
}


/*
Template.prototype.addEventHandlers = function() {
    for (let id in this.eventHandlers) {
        for (let eventType in this.eventHandlers[id]) {
            let fn = this.eventHandlers[id][eventType]
            let handlerNode = this.getElementById(id)
            if (handlerNode) {
                if (eventType == "load")
                    fn(this, null)
                else
                    handlerNode.addEventListener(eventType, (event) => fn(this, event))
            }
            else {
                console.error("Node with id " + id + " not found")
            }
        }
    }
    for (let child of Object.values(this.children)) {
        child.addEventHandlers()
    }
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
*/

export default Template

