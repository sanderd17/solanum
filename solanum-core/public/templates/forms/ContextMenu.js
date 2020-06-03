import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class ContextMenu extends Template {
    constructor(args) {
        super(args)
        this.init()
    }

    static defaultSize = [200, 300]

    async setTemplate(templatePath, properties) {
        const mdl = await import(`/templates/${templatePath}.js`)
        const cls = mdl.default

        const outerDiv = this.dom
        let [width, height] = cls.defaultSize
        outerDiv.style.width = width + 'px'
        outerDiv.style.height = height + 'px'

        // add template to inner div
        const template = new cls({
            parent: this,
            position: {left: '0px', top: '0px', right: '0px', bottom: '0px'},
            properties,
            eventHandlers: {},
        })

        const innerDiv = template.dom
        outerDiv.appendChild(innerDiv)
    }

    createDomNode() {
        this.classList.add(this.__className)
        this.classList.add('solanum')

        // create floating outer div
        this.dom.style.border = '1px solid darkgrey' // TODO make configuable
        this.dom.style.top = this.__cArgs.position.top
        this.dom.style.left = this.__cArgs.position.left
        //this.dom.style.transition = 'all .01s'

        this.dom.style.backgroundColor = 'white' // TODO make configurable

        document.body.appendChild(this.dom)
    }
}

export default ContextMenu