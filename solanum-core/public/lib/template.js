import style from './Styling.js'
import ts from './TagSet.js';

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
  * @property {Template} parent
  * @property {TemplatePosition} position
  * @property {object} props
  * @property {object} eventHandlers
  */

/**
 * Template
 */
class Template {
    /** @type {Object<string,TemplateConstructParams>} */
    static childDefinitions = null
    /** @type {Object<string,Template>} */
    children = {}

    /**
     * @param {TemplateConstructParams} p
     */
    constructor(p) {
        // store constructor args
        this.cArgs = p
        /** @type {Template?} */
        this.parent = p.parent
        this.position = p.position || {}
        /** @type {Object<string,function>} */
        this.eventHandlers = p.eventHandlers || {}
        this.eventHandlersEnabled = true
        this.propChangedHandlers = {}

        this.className = style.registerClassStyle(this.constructor)

        this.createDomNode()
        this.addEventHandlers()

        // Copy the prop values to own values
        // Set the props async, to allow the children to be initialised before prop setters are called
        Promise.resolve().then(() => {
            for (let [id, child] of Object.entries(this.children)) {
                child.classList.add(id)
            }
            for (let key in p.props) {
                this[key] = p.props[key]
            }
        })


    }

    get classList() {
        return this.dom.classList
    }

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

    addEventHandlers() {
        if (this.handleEvent == null) {
            this.handleEvent = (ev) => {
                if (ev.type in this.eventHandlers) {
                    this.eventHandlers[event.type](event, this.parent, this)
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
     */
    disableEventHandlers() {
        for (let eventType in this.eventHandlers) {
            this.dom.removeEventListener(eventType, this.handleEvent)
        }
        for (let childId in this.children) {
            this.children[childId].disableEventHandlers()
        }
    }

    setTagSubscription(instance, propName, tagPath) {
        // TODO remove listener to avoid memory leak after destroying
        ts.addSubscription(instance, propName, tagPath)
    }

    createDomNode() {
        if (this.dom) {
            return
        }
        this.dom = document.createElement('div')

        this.classList.add(this.className)
        this.classList.add('solanum')

        this.setPosition(this.position)

        if (this.parent) {
            this.parent.createDomNode()
            this.parent.dom.appendChild(this.dom)
        }

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
        ts.removeSubscription(this)
        this.children = null
    }
}


export default Template
