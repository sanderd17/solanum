import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Label extends Template {
    static defaultSize = [100, 20]

    constructor(...args) {
        super(...args)
        this.init()
    }


    set text(text) {
        this.__dom.innerText = text
    }

    get text() {
        return this.__dom.innerText
    }

    createDomNode() {
        super.createDomNode()
    }
}

export default Label