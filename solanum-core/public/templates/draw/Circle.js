import Template from '/lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Circle extends Template {
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

        this.elNode = document.createElementNS(ns, "circle")
        this.elNode.setAttribute("cx", "50")
        this.elNode.setAttribute("cy", "50")
        this.elNode.setAttribute("r", "50")
        this.elNode.setAttribute("pointer-events", "visible")

        this.classList.add(this.className)
        //circleNode.setAttribute("fill", "blue")

        this.dom.appendChild(this.elNode)

        for (let key of positionKeys)
            if (key in this.position) this.dom.style[key] = this.position[key]
    }
}

export default Circle

