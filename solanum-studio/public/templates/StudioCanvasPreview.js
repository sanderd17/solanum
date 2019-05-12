import Template from "../lib/template.js"
import P from '../lib/Prop.js'

class StudioCanvas extends Template {

    constructor(p) {
        super(p)
    }

    setComponent(mod, cmp) {
        // TODO: load component and render it inside this div
        console.log(`Set component to ${mod}:${cmp}`)
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElement("div")

        for (let key in this.position)
            this.domNode.style[key] = this.position[key]

        this.domNode.innerHTML = "Studio Canvas Preview"
        return this.domNode
    }

}

export default StudioCanvas