import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Checkbox extends Template {
    static defaultSize = [100, 20]

    set text(text) {
        let found = false
        for (let child of this.__dom.childNodes) {
            if (child.nodeName == 'INPUT')
                continue
            found = true
            child.nodeValue = text
        }
        if (!found)
            this.__dom.appendChild(document.createTextNode(text))
    }

    get text() {
        return this.__dom.innerText
    }

    set checked(checked) {
        this.__innerNode.checked = checked
    }

    get checked() {
        return this.__innerNode.checked
    }

    set disabled(disabled) {
        this.__innerNode.disabled = disabled
    }

    get disabled() {
        return this.__innerNode.disabled
    }

    createDomNode() {
        this.__dom = document.createElement("label")

        this.__innerNode = document.createElement("input")
        this.__innerNode.setAttribute("type", "checkbox")

        this.__dom.appendChild(this.__innerNode)
        this.__dom.style.setProperty('position', 'absolute')

        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default Checkbox