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

        this.svgNode.setAttribute("preserveAspectRatio", "none")

        let elWidth = parseInt(this.props.elWidth)
        let elHeight = parseInt(this.props.elHeight)
        let offset = 10 // TODO should match ofset on the studioCanvas

        this.elRect = document.createElementNS(ns, "rect")
        
        for (let key of Object.keys(this.position)) {
            let numVal = parseInt(this.position[key])
            if (this.position[key].substr(-1) == '%') {
                if (key == 'top' || key == 'bottom' || key == 'height')
                    this.position[key] = numVal * elHeight / 100
                else   
                    this.position[key] = numVal * elWidth / 100
            } else {
                this.position[key] = numVal
            }
        }

        let x, y, width, height
        if ('left' in this.position) {
            x = this.position.left + offset
            if ('width' in this.position) {
                width = this.position.width
            } else {
                width = elWidth - this.position.right - this.position.left
            }
        } else {
            // right and width should be defined
            width = this.position.width
            x = elWidth - this.position.right - this.position.width + offset
        }

        if ('top' in this.position) {
            y = this.position.top + offset
            if ('height' in this.position) {
                height = this.position.height
            } else {
                height = elHeight - this.position.bottom - this.position.top
            }
        } else {
            // right and width should be defined
            height = this.position.height
            y = elHeight - this.position.bottom - this.position.height + offset
        }

        this.elRect.setAttribute("x", x)
        this.elRect.setAttribute("y", y)
        this.elRect.setAttribute("width", width)
        this.elRect.setAttribute("height", height)
        this.elRect.setAttribute("pointer-events", "visible")
        this.elRect.classList.add('elRect')

        for (let id in this.props) {
            this.elRect.setAttribute(id, this.props[id])
        }

        this.svgNode.appendChild(this.elRect)

        if (this.eventHandlersEnabled) {
            for (let eventType in this.eventHandlers) {
                let fn = this.eventHandlers[eventType]
                if (eventType == "load")
                    fn(null)
                else
                    this.elRect.addEventListener(eventType, (event) => fn(event))
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

