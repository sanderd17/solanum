import style from './Styling.js'
import ts from './TagSet.js'
import Prop from './ComponentProp.js'
import {DomProp} from './ComponentProp.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']
/**
 * @typedef {{
 *  left?:   string,
 *  right?:  string,
 *  top?:    string,
 *  bottom?: string,
 *  width?:  string,
 *  height?: string
 * }} TemplatePosition
 */

 /**
  * @typedef {Object} TemplateConstructParams
  * @property {Template} parent
  * @property {TemplatePosition} position
  * @property {{string}} properties
  * @property {{Function}} eventHandlers
  */

/**
 * Template
 */
class Template {
    dom = document.createElement('div')


    /** @type {Object<string,Template>} */
    children = {}

    /** @type {Object<string, Prop>} */
    properties = {}

    /**
     * @param {TemplateConstructParams} p
     */
    constructor(p) {
        // store constructor args
        this.__cArgs = p
        /** @type {Template?} */
        this.__parent = p.parent
        /** @type {TemplatePosition} */
        this.__position = p.position || {}
        /** @type {Object<string,function>} */
        this.__eventHandlers = p.eventHandlers || {}
        this.__eventHandlersEnabled = true

        this.__className = style.registerClassStyle(this.constructor)
    }

    /**
     * Initialise component-defined properties
     * This needs to be called from the inheriting constructor
     */
    init() {
        this.createDomNode()
        for (let [id, child] of Object.entries(this.children)) {
            child.classList.add(id)
            this.dom.appendChild(child.dom)
        }
        this.addEventHandlers()

        // Handle the props defined on the inheriting class and coming from the constructor
        for (let [name, prop] of Object.entries(this.properties)) {
            if (prop instanceof DomProp && !prop.boundNode) {
                prop.setDomBinding(this.dom, name)
            }
            if (this.__cArgs.properties && name in this.__cArgs.properties) {
                // override binding from the constructor definition
                prop.setBinding(this.__cArgs.properties[name])
                prop.setContext(this.__cArgs.parent, this.dom) // Context of the prop is parent that called the constructor
            } else {
                prop.setContext(this, this.dom) // Context of the prop is this component
            }
            for (let dependency of prop.subscribedProps) {
                prop.ctx.properties[dependency].addChangeListener(() => {
                    prop.recalcValue()
                })
            }
        }
    }

    addChild(id, child) {
        this.children[id] = child
        child.classList.add(id)
        this.dom.appendChild(child.dom)
    }

    removeChild(id) {
        if (id in this.children) {
            this.children[id].destroy()
            delete this.children[id]
        }
    }

    /**
     * Set a new position
     * Warning: this may cause heavy recalculations in the browser and should
     * not be used for runtime animations
     * @param {object} newPosition 
     */
    setPosition(newPosition) {
        this.__position = newPosition
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

    /**
     * Send a CustomEvent from this dom node
     * @param {string} eventName Custom event name
     * @param {*} detail Extra data to pass on the event
     */
    dispatchEvent(eventName, detail) {
        this.dom.dispatchEvent(new CustomEvent(eventName, {bubbles: true, detail}))
    }

    addEventHandlers() {
        if (this.__handleEvent == null) {
            this.__handleEvent = (ev) => {
                if (ev.type in this.__eventHandlers) {
                    this.__eventHandlers[event.type](event, this.__parent, this)
                }
            }
        }
        // remove existing event handlers (if any)
        for (let eventType in this.__eventHandlers) {
            this.dom.removeEventListener(eventType, this.__handleEvent)
        }
        // add the new event handlers
        for (let eventType in this.__eventHandlers) {
            this.dom.addEventListener(eventType, this.__handleEvent)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     */
    disableEventHandlers() {
        for (let eventType in this.__eventHandlers) {
            this.dom.removeEventListener(eventType, this.__handleEvent)
        }
        for (let childId in this.children) {
            this.children[childId].disableEventHandlers()
        }
    }

    // TODO create dom as class field, use it in Dom-bound properties
    createDomNode() {
        this.classList.add(this.__className)
        this.classList.add('solanum')

        this.setPosition(this.__position)
    } 

    /**
     * Clean up itself and break references to all its children
     */
    destroy() {
        for (let child of Object.values(this.children)) {
            child.destroy()
        }
        if (this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom)
        }
        for (let prop of Object.values(this.properties)) {
            prop.destroy()
        }
        this.children = null
        this.properties = null
    }

    // QUICK ACCESS PROPS //

    get classList() {
        return this.dom.classList
    }

    /** @type {boolean} */
    set hidden(hidden) {
        this.dom.style.visibility = hidden ? 'hidden' : ''
    }
    get hidden() {
        return this.dom.style.visibility == 'hidden'
    }
}

export default Template
