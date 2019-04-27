import Template from '../../lib/template.js'

class Circle extends Template {
    constructor(...args) {
        super(...args)
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        this.domNode.setAttribute('version', '1.1')
        this.domNode.innerHTML = '<circle cx="100" cy="100" r="100" fill="blue"></circle>'
        return this.domNode
    }
}

export default Circle

