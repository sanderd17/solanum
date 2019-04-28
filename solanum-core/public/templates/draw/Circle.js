import Template from '../../lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Circle extends Template {
    constructor(p) {
        super(p)
        this.position = p.position || {}
    }

    get dom() {
        if (this.svgNode != null)
            return this.svgNode
        this.svgNode = document.createElementNS(ns, "svg")
        this.svgNode.setAttribute("viewBox", "0 0 100 100")
        this.svgNode.setAttribute("preserveAspectRatio", "none")

        let circleNode = document.createElementNS(ns, "circle")
        circleNode.setAttribute("cx", "50")
        circleNode.setAttribute("cy", "50")
        circleNode.setAttribute("r", "50")

        circleNode.setAttribute("fill", "blue")

        this.svgNode.appendChild(circleNode)

        for (let key of positionKeys)
            if (key in this.position) this.svgNode.style[key] = this.position[key]

        for (let eventType in this.eventHandlers) {
            let fn = this.eventHandlers[eventType]
            if (eventType == "load")
                fn(null)
            else
                circleNode.addEventListener(eventType, (event) => fn(event))
        }

        return this.svgNode
    }
}

export default Circle

