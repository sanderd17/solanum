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
        this.dom.addEventListener('click', () => this.selected = !this.selected)
    }

    set text(text) {
        this.dom.innerText = text
    }

    get text() {
        return this.dom.innerText
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