import ts from './TagSet.js';

class Prop {
    /**
     * Constructs a dynamic property
     * @param {string} expression A valid JS expression
     */
    constructor(expression) {
        this.subscribedTagValues = {}
        this.setBinding(expression)
    }

    /**
     * cached value of this property
     */
    get value() {
        return this.cachedValue
    }

    set value(newValue) {
        // TODO decide how to write value
    }

    setBinding(expression) {
        this.bindingFunction = Function(`return ({cmp, Tag}) => (${expression})`)()
    }

    removeTagSubscription(tagPath) {
        ts.removeSubscription(tagPath)
    }

    /**
     * 
     * @param {string} tagPath 
     * @param {any} defaultValue 
     * @param {Object<string,any>} subscribedTagValues 
     * @returns {any} value of the tag
     */
    getTagSubscriptionValue(tagPath, defaultValue, subscribedTagValues) {
        if (tagPath in this.subscribedTagValues) {
            let cachedValue = this.subscribedTagValues[tagPath]
            subscribedTagValues[tagPath] = cachedValue
            return cachedValue
        }
        let tagValue = ts.setSubscription(this, key, tagPath)
        if (tagValue === undefined) {
            tagValue = defaultValue
        }
        subscribedTagValues[tagPath] = tagValue
        return tagValue
    }

    /**
     * Recalculate the cached value
     * This needs to be called any time a possible needed value for this prop has changed (other prop or subscribed tag)
     * @param {Template} cmp 
     */
    recalcValue(cmp) {
        let subscribedTagValues = {}
        let Tag = (tagPath, defaultValue) => this.getTagSubscriptionValue(tagPath, defaultValue, subscribedTagValues)
        let changed = false
        let newValue = this.bindingFunction({cmp, Tag})

        for (let tagPath in this.subscribedTagValues) {
            if (!(tagPath in subscribedTagValues)) {
                delete this.subscribedTagValues[tagPath]
                this.removeTagSubscription(tagPath)
            }
        }
        console.log(subscribedTagValues)
        for (let key in subscribedTagValues) {
            console.log(key)
            this.subscribedTagValues[key] = subscribedTagValues[key]
        }

        if (newValue != this.cachedValue) {
            this.cachedValue = newValue
            changed = true
        }
        return changed
    }
}

export default Prop