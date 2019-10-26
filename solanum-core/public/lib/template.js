import style from './Styling.js'
import ts from './TagSet.js';

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']
/**
 * @typedef {Object} TemplatePosition
 * @property {string=} left 
 * @property {string=} right 
 * @property {string=} top 
 * @property {string=} bottom 
 * @property {string=} width 
 * @property {string=} height 
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

        this.__className = style.registerClassStyle(this.constructor)

        this.createDomNode()
        this.addEventHandlers()

        /*
        TODO What if props were functions or function bodies?
        * 5 >>> Function("return (5)")() returns just a number
        * 'test' >>> Function("return ('test')") returns just a string
        * myProp1 + 5 >>> Function("return ({myProp1, myProp2, Tag}) => {(myProp1 + 5)}")() returns a function, a parameter {myProp1, myProp2, Tag} can be passed. Tag can be a function that refers to the current element being set.... SUCCESS!!!!
        */

        /** @type {Object<string, function>} */
        this.__propBindings = {}

        // Copy the prop values to own values
        // Set the props async, to allow the children to be initialised before prop setters are called
        Promise.resolve().then(() => {
            for (let [id, child] of Object.entries(this.children)) {
                child.classList.add(id)
            }

            for (let key in p.props) {
                try {
                    // TODO get the names of own props from parent object
                    let propBinding = Function(`return ({myProp1, myProp2, Tag}) => (${p.props[key]})`)()
                    this.__propBindings[key] = propBinding
                } catch (e) {
                    console.error(`Error while defining function body ${p.props[key]}\n`, e)
                }
            }
            this.recalcPropValues()
        })
    }

    recalcPropValues() {
        let childrenNeedUpdates = false
        for (let [key, binding] of Object.entries(this.__propBindings)) {
            let oldValue = this[key]
            let Tag = function(tagpath) {
                // TODO subscribe to key on this object
                return undefined
            }
            try {
                let newValue = binding({
                    myProp: '', //TODO: get default prop keys and values of parent object
                    Tag
                })
                if (oldValue != newValue) {
                    this[key] = newValue
                    childrenNeedUpdates = true
                }
            } catch (e) {
                console.error(`Error setting property ${key} with binding ${binding.toString()}\n`, e)
            }
        }

        if (childrenNeedUpdates) {
            for (let child of Object.values(this.children)) {
                child.recalcPropValues()
            }
        }
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

    // DEFAULT PROPS //

    /** @type {boolean} */
    _hidden = false
    set hidden(hidden) {
        this.__dom.style.visibility = hidden ? 'hidden' : ''
    }
    get hidden() {
        return this._hidden
    }
}

export default Template
