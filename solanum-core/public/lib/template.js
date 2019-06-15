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
                if (id in obj) {
                    obj[id].setValue(val)
                    return true
                }
                return false
            },
        })

        this.className = style.registerClassStyle(this.constructor)

        this.createDomNode()
        this.addEventHandlersToDom()
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
        this.children = {}
        for (let id in children) {
            let type = children[id].type
            let child = new type(children[id])
            this.children[id] = child
            child.setParent(this)
            this.dom.appendChild(child.dom)
            child.classList.add(id)
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
        if (this.dom) {
            for (let key of positionKeys) {
                if (key in newPosition) {
                    this.dom.style[key] = newPosition[key]
                } else {
                    this.dom.style[key] = ''
                }
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

    addEventHandlersToDom() {
        if (this.handleEvent == null) {
            this.handleEvent = (ev) => {
                if (ev.type in this.eventHandlers) {
                    this.eventHandlers[event.type](event, this)
                }
            }
        }
        // remove existing event handlers (if any)
        for (let eventType in this.eventHandlers) {
            this.dom.removeEventListener(eventType, this.handleEvent)
        }
        // add the new event handlers
        for (let eventType in this.eventHandlers) {
            this.dom.addEventListener(eventType, this.handleEvent)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     * This needs to be called before the dom is created
     */
    disableEventHandlers() {
        for (let eventType in this.eventHandlers) {
            this.dom.removeEventListener(eventType, this.handleEvent)
        }
        for (let childId in this.children) {
            this.children[childId].disableEventHandlers()
        }
    }

    setPropListener(propName, fn) {
        this.propChangedHandlers[propName] = fn

    }

    /**
     * 
     * @param {Template} child 
     * @param {string} childPropId 
     * @param {*} binding 
     */
    registerPropBinding(child, childPropId, binding) {
        if (!(binding.boundName in this.boundProps)) {
            this.boundProps[binding.boundName] = []
        }
        this.boundProps[binding.boundName].push([child, childPropId, binding])
        // send updates to the children
        this.handlePropChanged(binding.boundName, this.props[binding.boundName], null)
    }


    handlePropChanged(id, newValue, oldValue) {
        if (this.boundProps[id]) {
            for (let  [child, childPropId, binding] of this.boundProps[id]) {
                child.handlePropChanged(childPropId, binding.transform(newValue), binding.transform(oldValue))
            }
        }
        if (this.propChangedHandlers[id]) {
            this.propChangedHandlers[id](newValue, oldValue)
        }
    }

    createDomNode() {
        this.dom = document.createElement('div')

        this.classList.add(this.className)

        this.setPosition(this.position)
    } 
}

Template.prototype.defaultProps = {}

export default Template
