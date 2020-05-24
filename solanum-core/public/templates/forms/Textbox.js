import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import {DomProp} from "/lib/ComponentProp.js"

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Textbox extends Template {
    static defaultSize = [100, 20]

    dom = document.createElement("input")

    properties = {
        value: new DomProp(this.dom, 'value', ''),
        disabled: new DomProp(this.dom, 'disabled', 'false'),
        type: new Prop('text'),
        step: new Prop(1),
        datalist: new Prop(null, (datalist) => {this.setDatalist(datalist)})
    }

    constructor(args) {
        super(args)
        this.init()
    }

    setDatalist(datalist) {
        if (!datalist) {
            if (this.datalistDom) {
                document.body.removeChild(this.datalistDom)
                this.dom.removeAttribute('list')
                this.datalistDom = undefined
            }
            return
        }
        if (!this.datalistDom) {
            this.datalistDom = document.createElement('datalist')
            this.datalistDom.id = Math.random().toString(36).substr(2, 11)
            this.dom.setAttribute('list', this.datalistDom.id)
            document.body.appendChild(this.datalistDom)
        }

        for (let child of this.datalistDom.children) {
            this.datalistDom.removeChild(child)
        }

        for (let el of datalist) {
            let elDom = document.createElement('option')
            elDom.value = el
            this.datalistDom.appendChild(elDom)
        }
    }
}

export default Textbox