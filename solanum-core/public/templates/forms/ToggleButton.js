import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class ToggleButton extends Template {
    static defaultSize = [100, 20]
    static defaultProps = {
        'selected': false,
        'text': 'Button',
    }

    constructor(...args) {
        super(...args)
        this.dom.innerText = this.props.text
        this.dom.addEventListener('click', () => this.props.selected = !this.props.selected)
    }

    handlePropChanged(id, newValue, oldValue) {
        if (id == 'text') {
            this.dom.innerText = newValue
        } else {
            // TODO
        }
    }

    createDomNode() {
        this.dom = document.createElement("button")
        this.dom.setAttribute("type", "button")

        this.classList.add(this.className)

        for (let key of positionKeys)
            if (key in this.position) this.dom.style[key] = this.position[key]
    }
}

export default ToggleButton