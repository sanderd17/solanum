import Template from "/lib/template.js"
import P from '/lib/Prop.js'

class SelectionRect extends Template {

    init() {
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElement("div")

        for (let key in this.position)
            this.domNode.style[key] = this.position[key]

        this.domNode.innerHTML = "Selection Rect"
        return this.domNode
    }

}

export default SelectionRect