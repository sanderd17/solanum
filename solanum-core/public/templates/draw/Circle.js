import Template from '/lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Circle extends Template {
    static defaultSize = [20, 20]

    fill = '#000000'

    get classList() {
        return this.__elNode.classList
    }

    addEventHandlers() {

        if (this.__handleEvent == null) {
            this.__handleEvent = (ev) => {
                if (ev.type in this.__eventHandlers) {
                    this.__eventHandlers[event.type](event, this.__parent, this)
                }
            }
        }
        // remove existing event handlers (if any)
        for (let eventType in this.__eventHandlers) {
            this.__elNode.removeEventListener(eventType, this.__handleEvent)
        }
        // add the new event handlers
        for (let eventType in this.__eventHandlers) {
            this.__elNode.addEventListener(eventType, this.__handleEvent)
        }
    }

    /**
     * Disable adding event handlers to the dom (recursively)
     * This needs to be called before the dom is created
     */
    disableEventHandlers() {
        for (let eventType in this.__eventHandlers) {
            this.__elNode.removeEventListener(eventType, this.__handleEvent)
        }
    }

    createDomNode() {
        this.__dom = document.createElementNS(ns, "svg")
        this.__dom.setAttribute("viewBox", "0 0 100 100")
        this.__dom.setAttribute("preserveAspectRatio", "none")

        this.__elNode = document.createElementNS(ns, "circle")
        this.__elNode.setAttribute("cx", "50")
        this.__elNode.setAttribute("cy", "50")
        this.__elNode.setAttribute("r", "50")
        this.__elNode.setAttribute("pointer-events", "visible")

        this.classList.add(this.__className)
        //circleNode.setAttribute("fill", "blue")

        this.__dom.appendChild(this.__elNode)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
        // Listen to changes of props > bring everything to the circle dom node
        this.__dom.addEventListener('propChanged', (event) => {
            this.__elNode.setAttribute(event.detail.propName, event.detail.newValue)
        })

    }
}

export default Circle

