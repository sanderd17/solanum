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

    getClassCss(className) {
        const entryToCss = (entry, id) => {
            let selector = `.${className}`
            if (entry.classes) {
                for (let className of entry.classes) {
                    selector += `.${className}`
                }
            }
            if (id != null) {
                selector += ` .${id}`
            }
            if (entry.states) {
                for (let state of entry.states) {
                    selector += `:${state}`
                }
            }
            let declarationString = Object.entries(entry.declarations).map(([p,v]) => `${p}: ${v}`).join(';\n\t')
            return selector + '{\n\t' + declarationString + '\n}\n'
        }
        let cls = this.styleMapping[className]
        let ownCss = ''
        if (cls.styles) {
            for (let entry of cls.styles) {
                ownCss += entryToCss(entry, null)
            }
        }

        let childCss = ''
        if (cls.childStyles) {
            for (let [id, definition] of Object.entries(cls.childStyles)) {
                for (let entry of definition) {
                    childCss += entryToCss(entry, id)
                }
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