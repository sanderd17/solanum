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
  * @typedef {Object} TemplateConstructParams
  * @property {TemplatePosition} position
  * @property {object} props
  * @property {object} eventHandlers
  */

/**
 * Template
 */
class Template {

    /**
     * @param {TemplateConstructParams} p
     */
    constructor(p) {
        this.children = {}
        /** @type {Template?} */
        this.parent = null
        /** Props that are bound to children */
        this.boundProps = {}
        this.position = p.position || {}
        this.eventHandlers = p.eventHandlers || {}
        this._props = p.props

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

    getValue() {
        throw new Error('`getValue` should be implemented by inheriting class')
    }

    /**
     * @param {any} value 
     */
    setValue(value) {
        throw new Error('`setValue` should be implemented by inheriting class')
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
    constructor(tagPath) {
        super()
        this.tagPath = tagPath
        this.tagValue = null // tag value cache
        ts.addTagHandler(tagPath, this)
    }

    onTagChanged(tag) {
        let oldValue = this.tagValue
        this.tagValue = tag.value
        this.template.handlePropChanged(this.id, tag.value, oldValue)
    }

    getValue() {
        return this.tagValue
    }

    setValue(value) {
        ts.writeTag(this.tagPath, value)
    }
}

// TODO BoundTagProps should react on binding change: unsubscribe from current tag path, and subscibe to new
class BoundTagProp extends Prop {
    constructor(boundName, transform) {
        super()
        this.boundName = boundName
        this.transform = transform
        this.tagValue = null // tag value cache
    }

    setContext(template, id) {
        this.template = template
        this.id = id
        setTimeout(() => {
            this.tagPath = this.transform(this.template.parent.props[this.boundName])
            ts.addTagHandler(this.tagPath, this)
        })
    }

    onTagChanged(tag) {
        let oldValue = this.tagValue
        this.tagValue = tag.value
        this.template.handlePropChanged(this.id, tag.value, oldValue)
    }

    getValue() {
        return this.tagValue
    }

    setValue(value) {
        ts.writeTag(this.tagPath, value)
    }
}

export default Template
export {RawProp, BoundProp, TagProp, BoundTagProp}

