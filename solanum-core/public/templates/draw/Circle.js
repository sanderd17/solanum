import Template from '/lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Circle extends Template {
    handlePropChanged(id, newValue, oldValue) {
        this.elNode.setAttribute(id, newValue)
    }

    addCssClass(className) {
        this.elNode.classList.add(className)
    }

    get dom() {
        if (this.svgNode != null)
            return this.svgNode
        this.svgNode = document.createElementNS(ns, "svg")
        this.svgNode.setAttribute("viewBox", "0 0 100 100")
        this.svgNode.setAttribute("preserveAspectRatio", "none")

        this.elNode = document.createElementNS(ns, "circle")
        this.elNode.setAttribute("cx", "50")
        this.elNode.setAttribute("cy", "50")
        this.elNode.setAttribute("r", "50")

        this.addCssClass(this.className)
        //circleNode.setAttribute("fill", "blue")
        for (let id in this.props) {
            this.elNode.setAttribute(id, this.props[id])
        }

        this.svgNode.appendChild(this.elNode)

        for (let key of positionKeys)
            if (key in this.position) this.svgNode.style[key] = this.position[key]

        if (this.eventHandlersEnabled) {
            for (let eventType in this.eventHandlers) {
                let fn = this.eventHandlers[eventType]
                if (eventType == "load")
                    fn(null)
                else
                    this.elNode.addEventListener(eventType, (event) => fn(event))
            }
        }

        return this.svgNode
    }
}

export default Circle

