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
        this.styleMapping[className] = cls
        this.addClassToDom(className)
        return className
    }

    reloadClassStyle(cls) {
        if (!this.classNameMappings.has(cls))
            this.registerClassStyle(cls)
        let className = this.classNameMappings.get(cls)
        if (cls.prototype.css)
            this.styleMapping[className] = cls
        this.addClassToDom(className)
    }

    /**
     * @param {string} selector 
     * @param {Object} declarations 
     */
    entryToCss(selector, declarations) {
        let declarationString = Object.entries(declarations)
            .filter(([p,v]) => typeof v != 'object') // get all properties that start with a lowercase letter or dash
            .map(([p,v]) => `${p.replace(/([A-Z])/g, (g) => '-' + g.toLowerCase()) }: ${v}`)
            .join(';\n\t')
        let css = '\n' + selector + '{\n\t' + declarationString + '\n}'

        css += Object.entries(declarations)
            .filter(([p,v]) => typeof v == 'object') // get sub-class selector or state
            .map(([p, v]) => this.entryToCss(selector + p, v))
            .join('')
        return css
    }

    getClassCss(className) {
        let cls = this.styleMapping[className]
        if (cls.styles) {
            return this.entryToCss('.' + className, cls.styles)
        }
        return null
    }   

    addClassToDom(className) {
        let css = this.getClassCss(className)
        if (!css)
            return
        let styleNode = this.styleNodes[className]
        if (!styleNode) {
            styleNode = document.createElement('style')
            styleNode.id = className
            document.head.appendChild(styleNode)
            this.styleNodes[className] = styleNode

        } else {
            for (let child of styleNode.childNodes)
                styleNode.removeChild(child)
        }
        styleNode.appendChild(document.createTextNode(css))
    }
}

let style = new Styling()

export default style // default stylesheet rendering the main page
export {Styling} // expose for testing and alternative stylesheets (f.e. for editing)