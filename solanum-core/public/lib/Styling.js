/**
 * Construct a static stylesheet to be used on the different components 
 */
class Styling {
    constructor() {
        /** @type {Map<*,string>} Map from class objects to unique class names as strings */
        this.classNameMappings = new Map()
        /** @type {*} Map from class names to style rules */
        this.styleMapping = {}
        /** @type {Object.<string, HTMLStyleElement>} reference to the stylesheet */
        this.styleNodes = {}
    }

    /**
     * Register the class style of the object, and get a unique className back
     * @param {*} cls a Template ineriting class
     * @returns {string} a unique class name
     */
    registerClassStyle(cls) {
        // store the style per constructor (per component type)
        if (this.classNameMappings.has(cls))
            return this.classNameMappings.get(cls)// only add a component once
        
        let className = cls.name + '_' + Math.random().toString(36).substr(2, 7)
        this.classNameMappings.set(cls, className)
        if (cls.prototype.css) {
            this.styleMapping[className] = cls.prototype.css
            this.addClassToDom(className)
        }
        return className
    }

    reloadClassStyle(cls) {
        if (!this.classNameMappings.has(cls))
            this.registerClassStyle(cls)
        let className = this.classNameMappings.get(cls)
        if (cls.prototype.css)
            this.styleMapping[className] = cls.prototype.css
        this.addClassToDom(className)
    }

    getClassCss(className) {
        return Object.entries(this.styleMapping[className]).map(([subSelector, rules]) => 
            `.${className}>.${subSelector} {` + 
                Object.entries(rules).map(([p,v]) => p + ':' + v).join(';') +
            '}\n'
        ).join('\n')
    }   

    addClassToDom(className) {
        let styleNode = this.styleNodes[className]
        if (!styleNode) {
            styleNode = document.createElement('style')
            document.head.appendChild(styleNode)
            this.styleNodes[className] = styleNode

        } else {
            for (let child of styleNode.childNodes)
                styleNode.removeChild(child)
        }
        styleNode.appendChild(document.createTextNode(this.getClassCss(className)))
    }
}

let style = new Styling()

export default style // default stylesheet rendering the main page
export {Styling} // expose for testing and alternative stylesheets (f.e. for editing)