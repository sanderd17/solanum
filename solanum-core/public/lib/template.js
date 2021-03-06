import style from './Styling.js'
import ts from './TagSet.js'
import Prop from './ComponentProp.js'
import {DomProp, StyleProp} from './ComponentProp.js'

// Observe dom objects for coming into the viewport
const intersectionObserver = new window.IntersectionObserver((entries, observer) =>
    entries.forEach((entry) => 
        entry.target.dispatchEvent(new CustomEvent('intersectionChangeObserved', {bubbles: false, detail:entry}))
    )
)

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
  * @property {Template} parent Link to the parent, null for the top template
  * @property {TemplatePosition} position position of the element
  * @property {{string}} [properties] custom property bindings
  * @property {CSSStyleDeclaration} [style] custom style bindings
  * @property {Object<string, (ev: Event, tmp: Template) => void>} [eventHandlers] event handling functions
  */

/**
 * Template
 */
class Template {
    static defaultSize = [100, 100]

    /** 
     * Reference to the dom node in the document
     * @type {HTMLElement|SVGElement}
     */
    dom = document.createElement('div')


    /** @type {Object<string,Template>} Child templates of this template*/
    children = {}

    /** @type {Object<string, Prop>} */
    properties = {}

    /** @type {Object} */
    prop = ((cmp) => new Proxy({}, {
        // get the property value
        get(target, key) {
            if (typeof key == 'symbol')
                return undefined
            if (key in cmp.properties) {
                cmp.accessedProps.push(key)
                return cmp.properties[key].value
            }
            return undefined
        },
        set(target, key, value) {
            if (typeof key == 'symbol')
                return false // symbols not allowed as property keys
            if (key in cmp.properties) {
                cmp.properties[key].value = value
                return true
            }
            return false
        }
    }))(this)

    /**
     * bound properties
     * @type {Object<string,StyleProp>}
     */
    styleBindings = {}


    /**
     * Custom styling for this node
     */
    get style() {
        return this.dom.style
    }

    /**
     * Access to the dom class list
     */
    get classList() {
        return this.dom.classList
    }

    /**
     * @param {TemplateConstructParams} p
     */
    constructor(p) {
        // store constructor args
        this.__cArgs = p
        /** @type {TemplatePosition} */
        this.__position = p.position || {}
        /** @type {Object<string,function>} */
        this.eventHandlers = p.eventHandlers || {}
        this.eventHandlersEnabled = true

        this.accessedProps = []

        this.__className = style.registerClassStyle(this.constructor)
    }

    /**
     * Initialise component-defined properties
     * This needs to be called from the inheriting constructor
     */
    init() {
        this.createDomNode()
        for (let [id, child] of Object.entries(this.children)) {
            if (child) {
                child.classList.add(id)
                this.dom.appendChild(child.dom)
            }
        }
        this.addEventHandlers()


        // Handle the props defined on the inheriting class and coming from the constructor
        for (let [name, prop] of Object.entries(this.properties)) {
            if (this.__cArgs.properties && name in this.__cArgs.properties) {
                // override binding from the constructor definition
                prop.setBinding(this.__cArgs.properties[name])
                prop.setContext(this.__cArgs.parent) // Context of the prop is parent that called the constructor
            } else {
                prop.setContext(this) // Context of the prop is this component
            }
            for (let dependency of prop.subscribedProps) {
                if (!prop.ctx.properties[dependency]) {
                    throw new Error(`Property ${dependency} is required by ${name}, but is not found`)
                }
                prop.ctx.properties[dependency].addChangeListener(() => {
                    prop.recalcValue()
                })
            }
        }

        for (let [name, styleBinding] of Object.entries(this.__cArgs.style || {})) {
            let styleProp = new StyleProp(this.dom, name, styleBinding)
            styleProp.setContext(this.__cArgs.parent)
            this.styleBindings[name] = styleProp

            for (let dependency of styleProp.subscribedProps) {
                if (!styleProp.ctx.properties[dependency]) {
                    throw new Error(`Property ${dependency} is required by style prop ${name}, but is not found`)
                }
                styleProp.ctx.properties[dependency].addChangeListener(() => {
                    styleProp.recalcValue()
                })
            }
        }
    }

    /**
     * @param {string} id
     * @param {Template} child
     */
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
        for (let key of positionKeys) {
            if (key in newPosition) {
                this.style[key] = newPosition[key]
            } else {
                this.style[key] = ''
            }
        }
    }

    /**
     * @type {number} Height of the object
     * This will return the calculated height of the object
     * When setting the height, it will override the heigt deduced from the position
     */
    get height() {
        if (this.style.height && this.style.height.endsWith('px')) {
            return parseInt(this.style.height.substring(0, this.style.length - 2))
        }
        return this.dom.clientHeight
    }
    set height(height) {
        this.style.height = height + 'px'
    }

    /**
     * @type {number} Width of the object
     * This will return the calculated width of the object
     * When setting the width, it will override the heigt deduced from the position
     */
    get width() {
        return this.dom.clientWidth
    }
    set width(width) {
        this.style.width = width + 'px'
    }

    /**
     * Send a CustomEvent from this dom node
     * @param {string} eventName Custom event name
     * @param {*} [detail] Extra data to pass on the event
     * @param {boolean} [bubbles] Whether this event should bubble up the tree, default = true
     */
    dispatchEvent(eventName, detail, bubbles) {
        if (bubbles == undefined) {
            bubbles = true
        }
        this.dom.dispatchEvent(new CustomEvent(eventName, {bubbles, detail}))
    }

    addEventHandlers() {
        if ('intersectionChangeObserved' in this.eventHandlers) {
            intersectionObserver.observe(this.dom)
        }   
        if (this.__handleEvent == null) {
            /** @param {Event} ev */
            this.__handleEvent = (ev) => {
                if (ev.type in this.eventHandlers) {
                    this.eventHandlers[ev.type](ev, this)
                }
            }
        }
        // remove existing event handlers (if any)
        for (let eventType in this.eventHandlers) {
            this.dom.removeEventListener(eventType, this.__handleEvent)
        }
        // add the new event handlers
        for (let eventType in this.eventHandlers) {
            this.dom.addEventListener(eventType, this.__handleEvent)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     */
    disableEventHandlers() {
        for (let eventType in this.eventHandlers) {
            this.dom.removeEventListener(eventType, this.__handleEvent)
        }
        for (let childId in this.children) {
            this.children[childId].disableEventHandlers()
        }
    }

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
}

export default Template
