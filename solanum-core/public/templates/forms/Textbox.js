import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import {DomProp} from "/lib/ComponentProp.js"

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Textbox extends Template {
    static defaultSize = [100, 20]

    properties = {
        value: new DomProp("''"),
        disabled: new DomProp('false'),
        type: new Prop("'text'"),
        step: new Prop("1"),
    }

    constructor(...args) {
        super(...args)
        this.init()
    }

    createDomNode() {
        this.dom = document.createElement("input")

        this.dom.style.setProperty('position', 'absolute')
        this.dom.style.setProperty('box-sizing', 'border-box')

        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.dom.appendChild(this.dom)
        }
    }
}

export default Textbox