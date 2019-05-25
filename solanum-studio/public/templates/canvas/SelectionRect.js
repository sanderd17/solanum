import Template from '/lib/template.js'

const ns = "http://www.w3.org/2000/svg"
const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class SelectionRect extends Template {
    handlePropChanged(id, newValue, oldValue) {
        if (id == 'selected') {
            console.log(newValue)
            // TODO set class which in turn changes style. Need style handling for this
            this.elNode.classList.toggle('selected', newValue)
        }
    }

    get dom() {
        if (this.svgNode != null)
            return this.svgNode
        
        this.svgNode = document.createElementNS(ns, "svg")
        this.classList.add(this.className)
        this.svgNode.setAttribute("viewBox", "0 0 100 100")
        this.svgNode.setAttribute("preserveAspectRatio", "none")

        this.elNode = document.createElementNS(ns, "rect")
        this.elNode.setAttribute("x", "0")
        this.elNode.setAttribute("y", "0")
        this.elNode.setAttribute("width", "100")
        this.elNode.setAttribute("height", "100")
        this.elNode.setAttribute("pointer-events", "visible")
        this.elNode.classList.add('elRect')

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

SelectionRect.prototype.css = {
    'elRect': {
        'fill': 'none',
        'stroke': '#000080',
        'stroke-width': '1px',
        'stroke-dasharray': '5 5',
    },
    'elRect:hover': {
        'cursor': 'pointer',
        'stroke-width': '3px',
    },
    'elRect.selected': {
        'stroke': '#000080',
        'stroke-width': '3px',
        'stroke-dasharray': 'none',
    },
}

export default SelectionRect

