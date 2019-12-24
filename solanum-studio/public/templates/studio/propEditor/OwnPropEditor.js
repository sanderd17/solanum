
import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import Textbox from '/templates/forms/Textbox.js'

class OwnPropEditor extends Template {

    constructor(...args) {
        super(...args)
        this.init()
    }

    properties = {
        component: new Prop('null', () => {
            this.loadModuleProperties()
        }),
        module: new Prop('null', () => {
            this.loadModuleProperties()
        })
    }

    static defaultSize = [300, 150]

    children  = {
    }

    loadModuleProperties() {
        let mdl = this.properties.module.value
        let cmp = this.properties.component.value

        console.log(mdl, cmp)
    }

}

export default OwnPropEditor