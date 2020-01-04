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
            .filter(([p,v]) => /^[a-z\-]/.test(p)) // get all properties that start with a lowercase letter or dash
            .map(([p,v]) => `${p}: ${v}`)
            .join(';\n\t')
        let css = selector + '{\n\t' + declarationString + '\n}\n'

        css += Object.entries(declarations)
            .filter(([p,v]) => /^[\.\:]/.test(p)) // get sub-class selector or state
            .map(([p, v]) => this.entryToCss(selector + p, v))
            .join('\n\n')
        return css
    }

    getClassCss(className) {
        let cls = this.styleMapping[className]
        let ownCss = ''
        if (cls.styles) {
            ownCss += this.entryToCss('.' + className, cls.styles)
        }

        let childCss = ''
        if (cls.childStyles) {
            for (let [id, definition] of Object.entries(cls.childStyles)) {
                childCss += this.entryToCss('.' + className + ' .' + id, definition)
            }
        }

        if (ownCss == '' && childCss == '')
            return null
        return ownCss + '\n' + childCss
    }   

    addClassToDom(className) {
        let css = this.getClassCss(className)
        if (!css)
            return
        let styleNode = this.styleNodes[className]
        if (!styleNode) {
            styleNode = document.createElement('style')
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