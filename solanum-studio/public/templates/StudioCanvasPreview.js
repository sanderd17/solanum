import Template from "../lib/template.js"
import P from '../lib/Prop.js'

class StudioCanvas extends Template {

    constructor(p) {
        super(p)

        this.instance = null
    }

    setComponent(mod, cmp) {
        // TODO: load component and render it inside this div
        console.log(`Set component to ${mod}:${cmp}`)
        import(`/API/Studio/openComponent?module=${mod}&component=${cmp}`).then((mdl) => {
            // cls is the class of the replaced template
            let cls = mdl.default

            // TODO get default size from class
            this.instance = new cls({
                position: {left: '0px', width: '100px', top:'0px', height:'100px'},
                props: {},
                eventHandlers: {}
            })

            for (let child of this.domNode.childNodes)
                this.domNode.removeChild(child)

            this.domNode.appendChild(this.instance.dom)
        });
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