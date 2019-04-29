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

    /**
     * @param {object} p
     * @param {object} props 
     * @param {object} eventHandlers 
     */
    constructor(p) {
        this.children = {}
        /** @type {Template?} */
        this.parent = null
        /** Props that are bound to children */
        this.boundProps = {}
        this.position = p.position || {}
        this.eventHandlers = p.eventHandlers || {}
        this._props = p.props || {}

        for (let id in p.props) {
            p.props[id].setContext(this, id)
        }

        /** @type Object<string,Template> */
        this.props = new Proxy(p.props || {}, {
            /**
             * @arg {object} obj
             * @arg {string} id
             */
            get: (obj, id) => {
                return obj[id].getValue()
            },
            /**
             * @arg {object} obj
             * @arg {string} id
             * @arg {object} val
             */
            set: (obj, id, val) => {
                obj[id].setValue(val)
            },
        })
    }

    setChildren(children) {
        this.children = children
        for (let id in this.children)
            this.children[id].setParent(this)
    }

    /**
     * Add a reference to the parent, and store as what id it's referenced
     * @param {Template} parent
     */
    setParent(parent) {
        this.parent = parent

        // for all props that are bound, let out parent warn us
        for (let id in this._props) {
            if (this._props[id] instanceof BoundProp) {
                parent.registerPropBinding(this, id, this._props[id])
            }
        }
    }

    setId(id) {
        this.id = id
        this.dom.id = id
        for (let childId in this.children) {
            this.children[childId].setId(id + '.' + childId)
        }
    }

    registerPropBinding(child, childPropId, binding) {
        this.boundProps[binding.boundName] = [child, childPropId, binding]
    }

    handlePropChanged(id, newValue, oldValue) {
        console.log(`changed: ${id}, ${oldValue} -> ${newValue}`)
        if (this.boundProps[id]) {
            let [child, childPropId, binding] = this.boundProps[id]
            console.log(child)
            child.handlePropChanged(childPropId, binding.transform(newValue), binding.transform(oldValue))
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

class Prop {
    constructor() {
        /** @type {Template?} template to which this prop was assigned */
        this.template = null
        /** @type {string?} id as which this prop was assigned */
        this.id = null
    }

    setContext(template, id) {
        this.template = template
        this.id = id
    }
}

class RawProp extends Prop {
    constructor(value) {
        super()
        this.value = value
    }

    getValue() {
        return this.value
    }

    setValue(value) {
        let oldValue = this.value
        this.value = value
        this.template.handlePropChanged(this.id, value, oldValue)
    }
}

class BoundProp extends Prop {
    constructor(boundName, transform) {
        super()
        this.boundName = boundName
        this.transform = transform || (x => x)
    }

    getValue() {
        return this.transform(this.template.parent.props[this.boundName])
    }

    // no setValue as it isn't possible to set this
}

class TagProp extends Prop {
    constructor(tagName) {
        super()
        this.tagName = tagName
    }

    getValue(template) {
        // TODO return tag value
    }

    setValue(value, template, id) {
        //TODO write to  tag
    }


}

let EvalTagPath = null

export default Template
export {RawProp, BoundProp, TagProp, EvalTagPath}

