import Template from '/lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Circle extends Template {
    static defaultSize = [20, 20]

    get fill() {
        return this.elNode.getAttribute('fill')
    }
    set fill(fill) {
        this.elNode.setAttribute('fill', fill)
    }

    get classList() {
        return this.elNode.classList
    }

    addEventHandlersToDom() {
        if (this.handleEvent == null) {
            this.handleEvent = (ev) => {
                if (ev.type in this.eventHandlers) {
                    this.eventHandlers[event.type](event, this.parent, this)
                }
            }
        }
        // remove existing event handlers (if any)
        for (let eventType in this.eventHandlers) {
            this.elNode.removeEventListener(eventType, this.handleEvent)
        }
        // add the new event handlers
        for (let eventType in this.eventHandlers) {
            this.elNode.addEventListener(eventType, this.handleEvent)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     * This needs to be called before the dom is created
     */
    disableEventHandlers() {
        for (let eventType in this.eventHandlers) {
            this.elNode.removeEventListener(eventType, this.handleEvent)
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

