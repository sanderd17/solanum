import style from './Styling.js'
import ts from './TagSet.js'
import Prop from './ComponentProp.js'

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

        this.createDomNode()
    }

    /**
     * Initialise component-defined properties
     * This needs to be called from the inheriting constructor
     */
    init() {
        for (let [id, child] of Object.entries(this.children)) {
            child.classList.add(id)
        }
        this.addEventHandlers()

        // Handle the props defined on the inheriting class and coming from the constructor
        for (let [name, prop] of Object.entries(this.properties)) {
            if (this.__cArgs.properties && name in this.__cArgs.properties) {
                // override binding from the constructor definition
                prop.setBinding(this.__cArgs.properties[name])
                prop.setContext(this.__cArgs.parent, this.__dom) // Context of the prop is parent that called the constructor
            } else {
                prop.setContext(this, this.__dom) // Context of the prop is this component
            }
            for (let dependency of prop.subscribedProps) {
                prop.ctx.properties[dependency].addChangeListener(() => {
                    prop.recalcValue()
                })
            }
        }
    }

    // shortcuts to properties and children
    get p() {return this.properties}
    get c() {return this.children}


    addChild(id, child) {
        this.children[id] = child
        child.classList.add(id)
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
        if (this.__dom) {
            for (let key of positionKeys) {
                if (key in newPosition) {
                    this.__dom.style[key] = newPosition[key]
                } else {
                    this.__dom.style[key] = ''
                }
            }
        }
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
            this.__dom.removeEventListener(eventType, this.__handleEvent)
        }
        // add the new event handlers
        for (let eventType in this.__eventHandlers) {
            this.__dom.addEventListener(eventType, this.__handleEvent)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     */
    disableEventHandlers() {
        for (let eventType in this.__eventHandlers) {
            this.__dom.removeEventListener(eventType, this.__handleEvent)
        }
        for (let childId in this.children) {
            this.children[childId].disableEventHandlers()
        }
    }

    createDomNode() {
        if (this.__dom) {
            return
        }
        this.__dom = document.createElement('div')

        this.classList.add(this.__className)
        this.classList.add('solanum')

        this.setPosition(this.__position)

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }

    } 

    /**
     * Clean up itself and break references to all its children
     */
    destroy() {
        for (let child of Object.values(this.children)) {
            child.destroy()
        }
        if (this.__dom.parentNode) {
            this.__dom.parentNode.removeChild(this.__dom)
        }
        for (let prop of Object.values(this.properties)) {
            prop.destroy()
        }
        this.children = null
        this.properties = null
    }

    // QUICK ACCESS PROPS //

    get classList() {
        return this.__dom.classList
    }

    /** @type {boolean} */
    set hidden(hidden) {
        this.__dom.style.visibility = hidden ? 'hidden' : ''
    }
    get hidden() {
        return this.__dom.style.visibility == 'hidden'
    }
}

export default Template
