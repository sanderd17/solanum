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
        * 
        * 
        * 
        * NIEUW IDEE:
        * Props zijn aparte key onder template. Dus `this.props.motor.value` om aan de waarde te komen. Kan afgekort wordne naar `this.p.motor.v`
        * Aparte klasse om props te definieren:
        *   * Getter om waarde te krijgen (van cache)
        *   * Setter beslist hoe waarde geschreven wordt
        *   * Default waarde meegeven in eigen template
        *   * Parent geeft een binding functie mee
        */

        /** @type {Object<string, function>} */
        this.__propBindings = {}

        // Copy the prop values to own values
        // Set the props async, to allow the inherited classes to be initialised before prop setters are called
        Promise.resolve().then(() => {
            for (let [id, child] of Object.entries(this.children)) {
                child.classList.add(id)
            }

            // TODO for every prop in props
            Object.defineProperty(this, 'propName', {
                set: function(newValue) {
                    // TODO update the binding function
                    // TODO Create a cached value
                    // TODO force a recalc on children
                },
                get: function() {
                    // TODO return the cached value
                }
            })

            // Turn the prop value into a function body. Allow the binding function to use the props of the parent.
            this.configurePropBindings(p.props)

            // Calculate the actual prop values from the defined functions
            this.recalcPropValues()
        })
    }

    /**
     * Configure the props of this object
     * This is a combination of the props defined on the class, and the prop bindings passed through the constructor
     * @param {Object<string, string>} props object passed through the constructor (from the parent)
     */
    configurePropBindings(props) {
        let ownPropNames = this.getPropNames()

        for (let key in props) {
            if (!ownPropNames.includes(key))
                console.warn(`Warning: prop with name ${key} is being used on constructor of ${Object.getPrototypeOf(this).constructor.name}, no such key is available`)
        }

        // Get all the prop names of the parent to construct the argument list
        let bindingArgNames = []
        if (this.__parent)
            bindingArgNames = this.__parent.getPropNames()
        // Add custom variable names that must be available
        bindingArgNames.push('Tag')

        // Transform all object keys into real props that can be listened to
        this.__propValueCache = {}
        for (let propName of ownPropNames) {
            if (props && propName in props) {
    // TODO this should use a getter/setter
    // TODO get difference between static and calculated props:
    // If a prop depends on a tag, it should write to the tag
    // If a prop is calculated from other props of the parent, it cannot be written to
    // If a prop is just static, it can be written 
                Object.defineProperty(this, propName, {
                    enumerable: true,
                    get: function() {
                        return this.__propValueCache[propName]
                    },
                    set: function(newValue) {
                        let oldValue = this.__propValueCache[propName]
                        this.__dom.dispatchEvent(new CustomEvent('propChanged', {
                            bubbles: true,
                            detail: {propName, oldValue, newValue}
                        }))
                        //throw new Error("Needs implementation")
                    }
                })
                try {
                    let propBinding = Function(`return ({${bindingArgNames.join(',')}}) => (${props[propName]})`)()
                    this.__propBindings[propName] = propBinding
                    // Create a function that evaluates the body given in the prop
                } catch (e) {
                    console.error(`Error while defining function body ${props[propName]} with arguments (${bindingArgNames.join(', ')})\n`, e)
                }
            } else {
                this.__propValueCache[propName] = this[propName]
                Object.defineProperty(this, propName, {
                    enumerable: true,
                    get: function() {
                        return this.__propValueCache[propName]
                    },
                    set: function(newValue) {
                        if (this.__propValueCache[propName] == newValue)
                            return // nothing to do
                        // TODO call OnPropChanged method or something to allow hooks
                        this.__propValueCache[propName] = newValue
                    }
                })
            }
        }
    }


    recalcPropValues() {
        // Keep track of updates, in case of updates to these values, children may need an update too
        let childrenNeedUpdates = false
        // Get the current values for the props of the parent. They need to be given as arguments
        let bindingArgs = {}
        if (this.__parent) {
            for (let key of this.__parent.getPropNames()) {
                bindingArgs[key] = this.__parent[key]
            }
        }

        for (let [key, binding] of Object.entries(this.__propBindings)) {
            // store the old value to check changes
            let oldValue = this.__propValueCache[key]
            // Special function 'Tag' allows props to subscribe to a tag. This function initialises a subscription on the tagset
            bindingArgs.Tag = (tagpath, defaultValue) => {
                // TODO manage subscriptions here: erase subscription when changed, still allow two subscriptions to one prop, ...
                let tagValue = ts.setSubscription(this, key, tagpath)
                return tagValue != undefined ? tagValue : defaultValue
            }

            try {
                // calculate the new value from the binding function
                let newValue = binding(bindingArgs)
                if (oldValue != newValue) {
                    this.__propValueCache[key] = newValue
                    childrenNeedUpdates = true
                    this.__dom.dispatchEvent(new CustomEvent('propChanged', {
                        bubbles: true,
                        detail: {propName: key, oldValue, newValue}
                    }))
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

    getPropNames() {
        return Object.keys(this)
            .filter(n => !n.startsWith('_')) // own properties starting with _ are used by this internally
            .filter(n => n != 'children') // children is not part of the props
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
