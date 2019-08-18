import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class ToggleButton extends Template {
    static defaultSize = [100, 20]

    constructor(...args) {
        super(...args)
        this.__dom.addEventListener('click', () => this.selected = !this.selected)
    }

    selected = false

    set text(text) {
        this.__dom.innerText = text
    }

    get text() {
        return this.__dom.innerText
    }

    createDomNode() {
        this.__dom = document.createElement("button")
        this.__dom.setAttribute("type", "button")

        this.classList.add(this.__className)

        for (let key of positionKeys) {
            if (key in this.__position) this.__dom.style[key] = this.__position[key]
        }
        
        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default ToggleButton