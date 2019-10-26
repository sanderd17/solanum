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

    /** @type {Object<string,any>} default props for this template */
    props = {}

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
        // Set the props async, to allow the inherited classes to be initialised before prop setters are called
        Promise.resolve().then(() => {
            for (let [id, child] of Object.entries(this.children)) {
                child.classList.add(id)
            }

            // Turn the prop value into a function body. Allow the binding function to use the props of the parent.

            // Get all the prop names to construct the argument list
            let bindingArgNames = []
            if (this.__parent)
                bindingArgNames = Object.keys(this.__parent.props)

            // Add custom variable names that must be available
            bindingArgNames.push('Tag')

            for (let key in p.props) {
                try {
                    // Create a function that evaluates the body given in the prop
                    let propBinding = Function(`return ({${bindingArgNames.join(',')}}) => (${p.props[key]})`)()
                    this.__propBindings[key] = propBinding
                } catch (e) {
                    console.error(`Error while defining function body ${p.props[key]}\n`, e)
                }
            }
            // Calculate the actual prop values from the defined functions
            this.recalcPropValues()
        })
    }

    recalcPropValues() {
        // Keep track of updates, in case of updates to these values, children may need an update too
        let childrenNeedUpdates = false
        // Get the current values for the props of the parent. They need to be given as arguments
        let bindingArgs = {}
        if (this.__parent) {
            for (let key in this.__parent.props) {
                bindingArgs[key] = this.__parent[key]
            }
        }

        for (let [key, binding] of Object.entries(this.__propBindings)) {
            // store the old value to check changes
            let oldValue = this[key]
            // Special function 'Tag' allows props to subscribe to a tag. This function initialises a subscription on the tagset
            bindingArgs.Tag = (tagpath, defaultValue) => {
                // TODO manage subscriptions here: erase subscription when changed, still allow two subscriptions to one prop, ...
                ts.setSubscription(this, key, tagpath)
                return defaultValue // TODO return the known value if the tag is already known
            }

            try {
                // calculate the new value from the binding function
                let newValue = binding(bindingArgs)
                if (oldValue != newValue) {
                    // TODO allow (grand)parents to follow changes. Sending messages?
                    this[key] = newValue
                    childrenNeedUpdates = true
                }
            } catch (e) {
                console.error(`Error setting property ${key} with binding ${binding.toString()}\n`, e)
            }
        }

        // If any value has changed, children might need updates too
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
