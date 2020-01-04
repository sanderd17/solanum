import Template from '/lib/template.js'
import {DomProp} from '/lib/ComponentProp.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Rect extends Template {

    dom = document.createElementNS(ns, "svg")
    elNode = document.createElementNS(ns, "rect")

    properties = {
        fill: new DomProp(this.elNode, 'fill', "'#000000'"),
        'stroke-dasharray': new DomProp(this.elNode, 'stroke-dasharray', 'null'),
    }

    constructor(...args) {
        super(...args)
        this.init()
    }

    createDomNode() {
        this.dom.setAttribute("viewBox", "0 0 100 100")
        this.dom.setAttribute("preserveAspectRatio", "none")

        this.elNode.setAttribute("x", "0")
        this.elNode.setAttribute("y", "0")
        this.elNode.setAttribute("width", "100")
        this.elNode.setAttribute("height", "100")
        this.elNode.setAttribute("pointer-events", "visible")

        this.classList.add(this.__className)

        this.dom.appendChild(this.elNode)

        for (let key of positionKeys)
            if (key in this.__position) this.dom.style[key] = this.__position[key]
    }
}

export default Rect

