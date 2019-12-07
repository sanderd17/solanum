import Template from '/lib/template.js'
import Prop from "/lib/ComponentProp.js"

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Checkbox extends Template {
    static defaultSize = [100, 20]

    properties = {
        text: new Prop("'Checkbox'", (text) => {
            let found = false
            for (let child of this.__dom.childNodes) {
                if (child.nodeName == 'INPUT')
                    continue
                found = true
                child.nodeValue = text
            }
            if (!found)
                this.__dom.appendChild(document.createTextNode(text))
        }),
        checked: new Prop("false", (newValue) => {
            this.__innerNode.checked = newValue
        }),
        disabled: new Prop("false", (newValue) => {
            this.__innerNode.disabled = newValue
        })
    }

    constructor(...args) {
        super(...args)
        this.init()
    }

    createDomNode() {
        this.__dom = document.createElement("label")

        this.__innerNode = document.createElement("input")
        this.__innerNode.setAttribute("type", "checkbox")

        this.__dom.appendChild(this.__innerNode)
        this.__dom.style.setProperty('position', 'absolute')

        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default Checkbox