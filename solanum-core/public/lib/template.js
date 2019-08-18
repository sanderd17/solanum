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
        this.__cArgs = p
        /** @type {Template?} */
        this.__parent = p.parent
        this.__position = p.position || {}
        /** @type {Object<string,function>} */
        this.__eventHandlers = p.eventHandlers || {}
        this.__eventHandlersEnabled = true
        this.__propChangedHandlers = {}

        this.__className = style.registerClassStyle(this.constructor)

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
        return this.__dom.classList
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

    setTagSubscription(instance, propName, tagPath) {
        // TODO remove listener to avoid memory leak after destroying
        ts.addSubscription(instance, propName, tagPath)
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
        ts.removeSubscription(this)
        this.children = null
    }
}


export default Template
