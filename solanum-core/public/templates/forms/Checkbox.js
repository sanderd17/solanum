import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class ToggleButton extends Template {
    static defaultSize = [100, 20]
    static defaultProps = {
        'checked': false,
        'text': 'Checkbox',
    }

    set text(text) {
        let found = false
        for (let child of this.dom.childNodes) {
            if (child.nodeName == 'INPUT')
                continue
            found = true
            child.nodeValue = text
        }
        if (!found)
            this.dom.appendChild(document.createTextNode(text))
    }

    get text() {
        return this.dom.innerText
    }

    set checked(checked) {
        this.innerNode.checked = checked
    }

    get checked() {
        return this.innerNode.checked
    }

    createDomNode() {
        this.dom = document.createElement("label")

        this.innerNode = document.createElement("input")
        this.innerNode.setAttribute("type", "checkbox")

        this.dom.appendChild(this.innerNode)

        this.classList.add(this.className)

        for (let key of positionKeys)
            if (key in this.position) this.dom.style[key] = this.position[key]
    }
}

export default ToggleButton