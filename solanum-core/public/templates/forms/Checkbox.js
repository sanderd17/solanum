import Template from '/lib/template.js'
import Prop from "/lib/ComponentProp.js"
import {DomProp} from "/lib/ComponentProp.js"

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Checkbox extends Template {
    static defaultSize = [100, 20]

    properties = {
        text: new Prop("'Checkbox'", (text) => {
            let found = false
            for (let child of this.dom.childNodes) {
                if (child.nodeName == 'INPUT')
                    continue
                found = true
                child.nodeValue = text
            }
            if (!found)
                this.dom.appendChild(document.createTextNode(text))
        }),
        checked: new DomProp("false"),
        disabled: new DomProp("false")
    }

    constructor(...args) {
        super(...args)
        this.properties.checked.setDomBinding(this.__innerNode, 'checked')
        this.properties.disabled.setDomBinding(this.__innerNode, 'disabled')
        this.init()
    }

    createDomNode() {
        this.dom = document.createElement("label")

        this.__innerNode = document.createElement("input")
        this.__innerNode.setAttribute("type", "checkbox")

        this.dom.appendChild(this.__innerNode)
        this.dom.style.setProperty('position', 'absolute')

        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.dom.appendChild(this.dom)
        }
    }
}

export default Checkbox