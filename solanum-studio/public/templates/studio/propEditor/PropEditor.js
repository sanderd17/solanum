import Template from "/lib/template.js"
import P from '/lib/Prop.js'

class PropEditor extends Template {
    constructor(...args) {
        super(...args)
        this.setChildren(this.childDefinitions)
    }
}

PropEditor.prototype.css = {
}

export default PropEditor