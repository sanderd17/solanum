import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Button extends Template {
    static defaultSize = [100, 20]

    constructor(...args) {
        super(...args)
        this.properties.text.addChangeListener((newValue) => {
            this.__innerButton.innerText = newValue
        })
        this.init()
    }

    properties = {
        text: new Prop("'Button'")
    }

    createDomNode() {
        super.createDomNode()
        this.__innerButton = document.createElement("button")
        this.__innerButton.setAttribute("type", "button")


        this.__innerButton.classList.add('solanum')
        this.__innerButton.classList.add(this.__className)

        this.__dom.appendChild(this.__innerButton)

    }
}

export default Button