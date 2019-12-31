import Template from '/lib/template.js'
import {DomProp} from '/lib/ComponentProp.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Circle extends Template {
    static defaultSize = [20, 20]

    dom = document.createElementNS(ns, "svg")
    elNode = document.createElementNS(ns, "circle")

    constructor(...args) {
        super(...args)
        this.init()
    }

    properties = {
        fill: new DomProp(this.elNode, 'fill', "'#000000'"),
    }

    get classList() {
        return this.elNode.classList
    }

    addEventHandlers() {
        if (this.__handleEvent == null) {
            this.__handleEvent = (ev) => {
                if (ev.type in this.eventHandlers) {
                    this.eventHandlers[event.type](event, this)
                }
            }
        }
        // remove existing event handlers (if any)
        for (let eventType in this.eventHandlers) {
            this.elNode.removeEventListener(eventType, this.__handleEvent)
        }
        // add the new event handlers
        for (let eventType in this.eventHandlers) {
            this.elNode.addEventListener(eventType, this.__handleEvent)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     * This needs to be called before the dom is created
     */
    disableEventHandlers() {
        for (let eventType in this.eventHandlers) {
            this.elNode.removeEventListener(eventType, this.__handleEvent)
        }
    }

    createDomNode() {
        this.dom.setAttribute("viewBox", "0 0 100 100")
        this.dom.setAttribute("preserveAspectRatio", "none")

        this.elNode.setAttribute("cx", "50")
        this.elNode.setAttribute("cy", "50")
        this.elNode.setAttribute("r", "50")
        this.elNode.setAttribute("pointer-events", "visible")

        this.classList.add(this.__className)

        this.dom.appendChild(this.elNode)

        for (let key of positionKeys)
            if (key in this.__position) this.dom.style[key] = this.__position[key]
    }
}

export default Circle

