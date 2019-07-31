import * as Prop from './Prop.js'
import P from './Prop.js'
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
  * @property {TemplatePosition} position
  * @property {object} props
  * @property {object} eventHandlers
  */

/**
 * Template
 */
class Template {
    static childDefinitions = null
    dynamicFields = {}

    /**
     * @param {TemplateConstructParams} p
     */
    constructor(p) {
        // store constructor args
        this.cArgs = p
        this.children = null
        /** @type {Template?} */
        this.parent = null
        this.position = p.position || {}
        this.eventHandlers = p.eventHandlers || {}
        this.eventHandlersEnabled = true
        this.propChangedHandlers = {}

        this.className = style.registerClassStyle(this.constructor)

        this.createDomNode()
        this.addEventHandlers()
        this.setChildren(this.constructor.childDefinitions)

        // Copy the prop values to own values
        for (let key in p.props) {
            this[key] = p.props[key]
        }
    }

    get classList() {
        return this.dom.classList
    }

    removeChild(id) {
        let child = this.children[id]
        this.dom.removeChild(child.dom)
        delete this.children[id]
    }

    addChild(id, childDefinition) {
        let type = childDefinition.type
        let child = new type(childDefinition)
        this.children[id] = child
        child.setParent(this)
        this.dom.appendChild(child.dom)
        child.classList.add(id)
    }

    setChildren(childDefinitions) {
        if (this.children) {
            // children have been previously defined, remove them
            for (let id in this.children) {
                this.removeChild(id)
            }
        }
        if (childDefinitions) {
            // childDefinitions are available, add the children
            this.children = {}
            for (let id in childDefinitions) {
                this.addChild(id, childDefinitions[id])
            }   
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
        this.dom = document.createElement('div')

        this.classList.add(this.className)

        this.setPosition(this.position)
    } 
}


export default Template
