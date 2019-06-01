import Template from '/lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Circle extends Template {
    handlePropChanged(id, newValue, oldValue) {
        this.elNode.setAttribute(id, newValue)
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElementNS(ns, "svg")
        this.domNode.setAttribute("viewBox", "0 0 100 100")
        this.domNode.setAttribute("preserveAspectRatio", "none")

        this.elNode = document.createElementNS(ns, "circle")
        this.elNode.setAttribute("cx", "50")
        this.elNode.setAttribute("cy", "50")
        this.elNode.setAttribute("r", "50")
        this.elNode.setAttribute("pointer-events", "visible")

        this.classList.add(this.className)
        //circleNode.setAttribute("fill", "blue")
        for (let id in this.props) {
            this.elNode.setAttribute(id, this.props[id])
        }

        this.domNode.appendChild(this.elNode)

        for (let key of positionKeys)
            if (key in this.position) this.domNode.style[key] = this.position[key]

        if (this.eventHandlersEnabled) {
            for (let eventType in this.eventHandlers) {
                let fn = this.eventHandlers[eventType]
                if (eventType == "load")
                    fn(null)
                else
                    this.elNode.addEventListener(eventType, (event) => fn(event))
            }
        }

        return this.domNode
    }
}

export default Circle

