import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Textbox extends Template {
    static defaultSize = [100, 20]

    set value(value) {
        this.__dom.value = value
    }

    get value() {
        return this.__dom.value
    }

    set disabled(disabled) {
        this.__dom.disabled = disabled
    }

    get disabled() {
        return this.__dom.disabled
    }

    set type(type) {
        this.__dom.type = type
    }

    get type() {
        return this.__dom.type
    }

    set step(step) {
        this.__dom.step = step
    }

    get step() {
        return this.__dom.step
    }

    createDomNode() {
        this.__dom = document.createElement("input")

        this.__dom.style.setProperty('position', 'absolute')
        this.__dom.style.setProperty('box-sizing', 'border-box')

        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default Textbox