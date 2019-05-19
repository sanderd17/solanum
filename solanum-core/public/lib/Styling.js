/**
 * Construct a static stylesheet to be used on the different components 
 */
class Styling {
    constructor() {
        this.styleMapping = {}
        this.styleNode = null
    }

    registerCss(className, css) {
        if (className in this.styleMapping)
            return // classes can only be added once; they are unique per component
        this.styleMapping[className] = css
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
        this.styleNode = document.createElement('style')
        this.styleNode.appendChild(document.createTextNode(this.getCss()))
        document.head.appendChild(this.styleNode)
    }
}

let style = new Styling()

export default style // default stylesheet rendering the main page
export {Styling} // expose for testing and alternative stylesheets (f.e. for editing)