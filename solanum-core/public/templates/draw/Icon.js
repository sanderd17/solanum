import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Icon extends Template {

    dom = document.createElement("img")

    properties = {
        iconSet: new Prop("''"),
        iconPath: new Prop("''"),
    }

    constructor(args) {
        super(args)
        for (let name of ['iconSet', 'iconPath']) {
            this.properties[name].addChangeListener((newValue) => {
                this.resetUrl()
            })
        }
        this.init()
    }

    resetUrl() {
        if (this.prop.iconPath == '' || this.prop.iconSet == '')
            return
        this.dom.setAttribute(
            "src", 
            `/icons?iconSet=${encodeURIComponent(this.prop.iconSet)}&iconPath=${encodeURIComponent(this.prop.iconPath)}`
        )
    }

    createDomNode() {
        this.dom.setAttribute("preserveAspectRatio", "none")

        this.classList.add('solanum')
        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.dom.style[key] = this.__position[key]
    }
}

export default Icon