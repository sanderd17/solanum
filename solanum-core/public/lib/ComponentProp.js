import ts from './TagSet.js';

/** @typedef { import('./template').default } Template */

class Prop {
    /**
     * Constructs a dynamic property
     * @param {string} expression A valid JS expression
     * @param {((newValue: any, oldValue: any) => void)=} changeListener
     * @param {TagSet=} tsMock mock for unit testing purposes
     */
    constructor(expression, changeListener, tsMock) {
        if (tsMock) {
            this.ts = tsMock
        } else {
            this.ts = ts
        }
        /** @type {Set<string>} */
        this.subscribedTags = new Set()
        /** @type {Set<string>} */
        this.subscribedProps = new Set()
        /** @type {Set<Function>} */
        this.changeListeners = new Set()
        if (changeListener) {
            this.addChangeListener(changeListener)
        }
        /** @type {Template} */
        this.ctx = null
        this.setBinding(expression)
    }

    /**
     * Set the context and do a first recalculation
     * @param {Template} ctx Component supplying the props that can be used for the prop bindings. Can be a parent or the same as the prop holder
     */
    setContext(ctx) {
        this.ctx = ctx
    
        // Do a first recalc, will subscribe to the original tags, and store which props to use
        this.recalcValue()
    }

    /**
     * @param {(newValue: any, oldValue: any) => void} fn 
     */
    addChangeListener(fn) {
        this.changeListeners.add(fn)
    }

    /**
     * @param {(newValue: any, oldValue: any) => void} fn 
     */
    removeChangeListener(fn) {
        this.changeListeners.delete(fn)
    }

    /**
     * Value of this property
     */
    get value() {
        return this.cachedValue
    }

    set value(newValue) {
        if (newValue === this.cachedValue)
            return
        // Sets only the cached value, if a recalc happens at some point, the value will be the original
        let oldValue = this.cachedValue
        this.cachedValue = newValue
        for (let fn of this.changeListeners) {
            fn(newValue, oldValue)
        }
    }

    /**
     * Set the binding function for this prop
     * @param {string} expression Syntactically valid JS expression
     */
    setBinding(expression) {
        this.bindingFunction = Function(`return ({Prop, Tag}) => (${expression})`)()
    }

    /**
     * Keep track of the used props, and return the actual value
     * @param {string} propName 
     * @param {Template} cmp 
     * @param {Set<string>} subscribedProps
     */
    getPropertyValue(propName, cmp, subscribedProps) {
        let val = cmp.properties[propName].value
        subscribedProps.add(propName)
        return val
    }

    /**
     * Force a recalculation of the cached value
     * This needs to be called any time a subscribed tag or prop value has changed
     * This should not be called in other occasions to make sure the cached value remains intact
     */
    recalcValue() {
        let subscribedTags = new Set()
        /** local function to subscribe to tags
         * @param {string} tagPath 
         * @param {any} defaultValue */
        let Tag = (tagPath, defaultValue) => {
            subscribedTags.add(tagPath)
            this.ts.addPropSubscription(this, tagPath)
            let tagValue = this.ts.getCachedTagValue(tagPath)
            if (tagValue === undefined)
                return defaultValue
            return tagValue
        }

        this.subscribedProps.clear()
        /** local function to subscibe to props
         * @param {string} propName */
        let Prop = (propName) => {
            this.subscribedProps.add(propName)
            if (!this.ctx) {
                console.error(`Prop requested before context was initialised`)
                return undefined
            }
            if (!this.ctx.properties || !this.ctx.properties[propName]) {
                console.error(`Prop with name ${propName} is not defined on context`)
                return undefined
            }
            return this.ctx.properties[propName].value
        }

        let newValue = this.bindingFunction({Prop, Tag})

        // Remove unused tag paths
        for (let tagPath of this.subscribedTags) {
            if (!subscribedTags.has(tagPath)) {
                this.subscribedTags.delete(tagPath)
                this.ts.removePropSubscription(this, tagPath)
            }
        }
        this.subscribedTags = subscribedTags

        this.value = newValue
    }

    /**
     * Remove all binding to this prop
     */
    destroy() {
        for (let tagPath of this.subscribedTags) {
            this.ts.removePropSubscription(this, tagPath)
        }
        this.ctx = null
    }
}

//TODO investigate MutationObserver to react on external dom changes
class DomProp extends Prop {
    /**
     * @param {Node} boundNode
     * @param {string} boundAttribute
     */
    setDomBinding(boundNode, boundAttribute) {
        this.boundNode = boundNode
        this.boundAttribute = boundAttribute
    }
    
    get value() {
        return this.boundNode[this.boundAttribute]
    }

    set value(newValue) {
        let oldValue = this.boundNode[this.boundAttribute]
        if (newValue === oldValue)
            return
        // Sets only the cached value, if a recalc happens at some point, the value will be the original
        this.boundNode[this.boundAttribute] = newValue
        for (let fn of this.changeListeners) {
            fn(newValue, oldValue)
        }
    }
}

export default Prop
export {DomProp}