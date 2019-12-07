import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Rect extends Template {

    constructor(...args) {
        super(...args)
        this.init()
        for (let name in this.properties) {
            this.properties[name].addChangeListener((newValue) => {
                this.__elNode.setAttribute(name, newValue)
            })
        }
    }

    properties = {
        fill: new Prop("'#000000'"),
        'stroke-dasharray': new Prop('"None"'),
    }

    createDomNode() {
        this.__dom = document.createElementNS(ns, "svg")
        this.__dom.setAttribute("viewBox", "0 0 100 100")
        this.__dom.setAttribute("preserveAspectRatio", "none")

        this.__elNode = document.createElementNS(ns, "rect")
        this.__elNode.setAttribute("x", "0")
        this.__elNode.setAttribute("y", "0")
        this.__elNode.setAttribute("width", "100")
        this.__elNode.setAttribute("height", "100")
        this.__elNode.setAttribute("pointer-events", "visible")

        this.classList.add(this.__className)

        this.__dom.appendChild(this.__elNode)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default Rect

