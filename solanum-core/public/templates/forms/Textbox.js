import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Textbox extends Template {
    static defaultSize = [100, 20]

    set value(value) {
        this.dom.value = value
    }

    get value() {
        return this.dom.value
    }

    set disabled(disabled) {
        this.dom.disabled = disabled
    }

    get disabled() {
        return this.dom.disabled
    }

    set type(type) {
        this.dom.type = type
    }

    get type() {
        return this.dom.type
    }

    set step(step) {
        this.dom.step = step
    }

    get step() {
        return this.dom.step
    }

    createDomNode() {
        this.dom = document.createElement("input")

        this.dom.style.setProperty('position', 'absolute')
        this.dom.style.setProperty('box-sizing', 'border-box')

        this.classList.add(this.className)

        for (let key of positionKeys)
            if (key in this.position) this.dom.style[key] = this.position[key]

        if (this.parent) {
            this.parent.createDomNode()
            this.parent.dom.appendChild(this.dom)
        }
    }
}

export default Textbox