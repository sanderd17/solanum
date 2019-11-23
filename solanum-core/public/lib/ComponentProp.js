import ts from './TagSet.js';

/** @typedef { import('./template').default } Template */

class Prop {
    /**
     * Constructs a dynamic property
     * @param {string} expression A valid JS expression
     * @param {TagSet} tsMock mock for unit testing purposes
     */
    constructor(expression, tsMock) {
        if (tsMock) {
            this.ts = tsMock
        } else {
            this.ts = ts
        }
        /** @type {Set<string>} */
        this.subscribedTags = new Set()
        /** @type {Set<string>} */
        this.subscribedProps = new Set()
        /** @type {Template} */
        this.dependencyCmp = null
        this.setBinding(expression)

        // Do a first recalc, will subscribe to the original tags, and store which props to use
        this.recalcValue()
    }

    /**
     * cached value of this property
     */
    get value() {
        return this.cachedValue
    }

    set value(newValue) {
        // Sets only the cached value, if a recalc happens at some point, the value will be the original
        this.cachedValue = newValue
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
     * @param {Template?} cmp The component on which to get the props from. If null, will use the previous value 
     * @returns {boolean} true if the value has changed
     */
    recalcValue(cmp) {
        if (!cmp) {
            cmp = this.dependencyCmp
        } else {
            this.dependencyCmp = cmp
        }

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
            if (!cmp)
                return undefined // fallback for initial call
            return cmp.properties[propName].value
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

        if (newValue != this.cachedValue) {
            this.cachedValue = newValue
            return true
        }
        return false
    }
}

export default Prop