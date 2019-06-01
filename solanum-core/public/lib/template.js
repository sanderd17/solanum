import * as Prop from './Prop.js'
import P from './Prop.js'
import style from './Styling.js'

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
        this.eventHandlersEnabled = true
        this.propChangedHandlers = {}
        this._props = p.props

        for (let id in this.defaultProps) {
            if (!(id in p.props))
                p.props[id] = P.Raw(this.defaultProps[id])
        }

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
                return undefined
            },
            /**
             * @arg {object} obj
             * @arg {string} id
             * @arg {object} val
             */
            set: (obj, id, val) => {
                console.log('set')
                if (id in obj) {
                    obj[id].setValue(val)
                    return true
                }
                return false
            },
        })

        this.className = style.registerClassStyle(this.constructor)

        this.init()
    }

    /**
     * Init function to be implemented by the separate components
     */
    init() {}

    get classList() {
        return this.dom.classList
    }

    setChildren(children) {
        let parentNode = null
        if (this.domNode != null) {
            // resetting children after render
            parentNode = this.domNode.parentNode
            parentNode.removeChild(this.domNode)
            this.domNode = null
        }
        this.children = children
        for (let id in this.children)
            this.children[id].setParent(this)
        
        // Re-add dom
        if (parentNode != null) {
            parentNode.appendChild(this.dom)
        }
    }

    /**
     * Add a reference to the parent, and store as what id it's referenced
     * @param {Template} parent
     */
    setParent(parent) {
        this.parent = parent

        // for all props that are bound, let our parent warn us
        for (let id in this._props) {
            if (this._props[id] instanceof Prop.Bound) {
                parent.registerPropBinding(this, id, this._props[id])
            }
        }
    }

    /**
     * Set a new position
     * Warning: this may cause heavy recalculations in the browser and should
     * not be used for runtime animations
     * @param {object} newPosition 
     */
    setPosition(newPosition) {
        this.position = newPosition
        if (this.domNode) {
            for (let key of positionKeys)
                if (key in newPosition) this.domNode.style[key] = newPosition[key]
        }
    }

    setId(id) {
        this.id = id
        this.dom.id = id
        for (let childId in this.children) {
            this.children[childId].setId(id + '.' + childId)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     * This needs to be called before the dom is created
     */
    disableEventHandlers() {
        this.eventHandlersEnabled = false
        for (let childId in this.children) {
            this.children[childId].disableEventHandlers()
        }
    }

    setPropListener(propName, fn) {
        this.propChangedHandlers[propName] = fn

    }

    registerPropBinding(child, childPropId, binding) {
        this.boundProps[binding.boundName] = [child, childPropId, binding]
    }

    handlePropChanged(id, newValue, oldValue) {
        console.log(`changed: ${id}, ${oldValue} -> ${newValue}`)
        if (this.boundProps[id]) {
            let [child, childPropId, binding] = this.boundProps[id]
            child.handlePropChanged(childPropId, binding.transform(newValue), binding.transform(oldValue))
        }
        if (this.propChangedHandlers[id]) {
            this.propChangedHandlers[id](newValue, oldValue)
        }
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElement('div')

        this.classList.add(this.className)

        this.setPosition(this.position)
        if (this.eventHandlersEnabled) {
            for (let eventType in this.eventHandlers) {
                let fn = this.eventHandlers[eventType]
                if (eventType == "load")
                    fn(null)
                else
                    this.domNode.addEventListener(eventType, (event) => fn(event, this))
            }
        }
        for (let [id, child] of Object.entries(this.children)) {
            this.domNode.appendChild(child.dom)
            child.classList.add(id)
        }   
        return this.domNode
    } 
}

Template.prototype.defaultProps = {}

export default Template
