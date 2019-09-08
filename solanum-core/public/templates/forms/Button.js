import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Button extends Template {
    static defaultSize = [100, 20]

    set text(text) {
        this.__innerButton.innerText = text
    }

    get text() {
        return this.__innerButton.innerText
    }

    createDomNode() {
        super.createDomNode()
        this.__innerButton = document.createElement("button")
        this.__innerButton.setAttribute("type", "button")


        this.__innerButton.classList.add('solanum')
        this.__innerButton.classList.add(this.__className)

        this.__dom.appendChild(this.__innerButton)

    }
}

export default Button