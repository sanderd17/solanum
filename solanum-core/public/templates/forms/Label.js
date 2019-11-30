import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Label extends Template {
    static defaultSize = [100, 20]

    constructor(...args) {
        super(...args)
        this.properties.text.addChangeListener((newValue) => {
            this.__dom.innerText = newValue
        })
        this.init()
    }

    properties = {
        text: new Prop("'Label'")
    }

    createDomNode() {
        super.createDomNode()
    }
}

export default Label