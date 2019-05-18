import * as Prop from './Prop.js'
import P from '/lib/Prop.js'

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
        // store constructor args
        this.cArgs = p
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
                if (id in obj)
                    return obj[id].getValue()
                if (id in this.defaultProps)
                    return this.defaultProps[id]
                return undefined
            },
            /**
             * @arg {object} obj
             * @arg {string} id
             * @arg {object} val
             */
            set: (obj, id, val) => {
                if (id in obj) {
                    obj[id].setValue(val)
                } else {
                    // key was not present on props, set as a raw prop
                    obj[id] = P.Raw(val)
                }
            },
        })

        this.init()
    }

    /**
     * Init function to be implemented by the separate components
     */
    init() {}

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
            if (this._props[id] instanceof Prop.Bound) {
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

Template.prototype.defaultProps = {}

export default Template
