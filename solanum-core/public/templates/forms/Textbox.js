import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Textbox extends Template {
    static defaultSize = [100, 20]

    properties = {
        value: new Prop("''", (newValue) => {
            this.__dom.value = newValue
        }),
        disabled: new Prop('false', (newValue) => {
            this.__dom.disabled = newValue
        }),
        type: new Prop("'text'", (newValue) => {
            this.__dom.type = newValue
        }),
        step: new Prop("1", (newValue) => {
            this.__dom.step = newValue
        }),
    }

    constructor(...args) {
        super(...args)
        this.init()
    }

    createDomNode() {
        this.__dom = document.createElement("input")

        this.__dom.style.setProperty('position', 'absolute')
        this.__dom.style.setProperty('box-sizing', 'border-box')

        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default Textbox