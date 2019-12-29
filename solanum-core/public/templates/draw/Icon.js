import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Icon extends Template {

    constructor(...args) {
        super(...args)
        for (let name of ['iconSet', 'iconPath']) {
            this.properties[name].addChangeListener((newValue) => {
                this.resetUrl()
            })
        }
        this.init()
    }

    properties = {
        iconSet: new Prop("''"),
        iconPath: new Prop("''"),
    }

    resetUrl() {
        if (this.properties.iconPath.value == '' || this.properties.iconSet.value == '')
            return
        this.__dom.setAttribute(
            "src", 
            `/icons?iconSet=${encodeURIComponent(this.properties.iconSet.value)}&iconPath=${encodeURIComponent(this.properties.iconPath.value)}`
        )
    }

    createDomNode() {
        this.__dom = document.createElement("img")
        this.__dom.setAttribute("preserveAspectRatio", "none")

        this.classList.add('solanum')
        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default Icon