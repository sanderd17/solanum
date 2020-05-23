import Template from '/lib/template.js'
import Prop from "/lib/ComponentProp.js"
import {DomProp} from "/lib/ComponentProp.js"

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Checkbox extends Template {
    static defaultSize = [100, 20]

    dom = document.createElement("label")
    innerNode = document.createElement("input")

    properties = {
        text: new Prop('Checkbox', (text) => {
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
        checked: new DomProp(this.innerNode, 'checked', "false"),
        disabled: new DomProp(this.innerNode, 'disabled', "false")
    }

    constructor(args) {
        super(args)
        this.init()
    }

    createDomNode() {
        this.innerNode.setAttribute("type", "checkbox")

        this.dom.appendChild(this.innerNode)
        this.dom.style.setProperty('position', 'absolute')

        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.dom.style[key] = this.__position[key]
    }
}

export default Checkbox