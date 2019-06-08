import Template from '/lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Rect extends Template {
    handlePropChanged(id, newValue, oldValue) {
        this.elNode.setAttribute(id, newValue)
    }

    init() {
        for (let id in this.props) {
            this.elNode.setAttribute(id, this.props[id])
        }
    }

    createDomNode() {
        this.dom = document.createElementNS(ns, "svg")
        this.dom.setAttribute("viewBox", "0 0 100 100")
        this.dom.setAttribute("preserveAspectRatio", "none")

        this.elNode = document.createElementNS(ns, "rect")
        this.elNode.setAttribute("x", "0")
        this.elNode.setAttribute("y", "0")
        this.elNode.setAttribute("width", "100")
        this.elNode.setAttribute("height", "100")
        this.elNode.setAttribute("pointer-events", "visible")

        this.classList.add(this.className)

        this.dom.appendChild(this.elNode)

        for (let key of positionKeys)
            if (key in this.position) this.dom.style[key] = this.position[key]
    }
}

export default Rect

