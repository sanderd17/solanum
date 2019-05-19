/**
 * Construct a static stylesheet to be used on the different components 
 */
class Styling {
    constructor() {
        /** @type {Map<*,string>} Map from class objects to unique class names as strings */
        this.classNameMappings = new Map()
        /** @type {*} Map from class names to style rules */
        this.styleMapping = {}
        /** @type {HTMLStyleElement?} reference to the stylesheet */
        this.styleNode = null
    }

    /**
     * Register the class style of the object, and get a unique className back
     * @param {*} obj a Template instance
     * @returns {string} a unique class name
     */
    registerClassStyle(obj) {
        // store the style per constructor (per component type)
        let cls = obj.constructor
        if (this.classNameMappings.has(cls))
            return this.classNameMappings.get(cls)// only add a component once
        
        let className = cls.name + '_' + Math.random().toString(36).substr(2, 7)
        this.classNameMappings.set(cls, className)
        if (obj.css)
            this.styleMapping[className] = obj.css
        return className
    }

    resetStyleOfClass(obj) {
        let cls = obj.constructor
        if (!this.classNameMappings.has(cls))
            this.registerClassStyle(obj)
        let className = this.classNameMappings.get(cls)
        if (obj.css)
            this.styleMapping[className] = obj.css
        this.addToDom()
    }

    getCss() {
        return Object.entries(this.styleMapping).map(([className, subSelectors]) => 
            `.${className} ` + Object.entries(subSelectors).map(([subSelector, rules]) =>
                `.${subSelector} {` + 
                    Object.entries(rules).map(([p,v]) => p + ':' + v).join(';') +
                '}\n'
            )
        ).join('\n')
    }   

    addToDom() {
        if (!this.styleNode) {
            this.styleNode = document.createElement('style')
            document.head.appendChild(this.styleNode)
        } else {
            for (let child of this.styleNode.childNodes)
                this.styleNode.removeChild(child)
        }
        this.styleNode.appendChild(document.createTextNode(this.getCss()))
    }
}

let style = new Styling()

export default style // default stylesheet rendering the main page
export {Styling} // expose for testing and alternative stylesheets (f.e. for editing)