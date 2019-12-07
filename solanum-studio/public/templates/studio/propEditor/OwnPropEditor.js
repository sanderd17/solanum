
import Template from "/lib/template.js"
import Textbox from '/templates/forms/Textbox.js'

class OwnPropEditor extends Template {

    constructor(...args) {
        super(...args)
        this.init()
    }

    static defaultSize = [300, 150]
    children  = {
    }
    
}

export default OwnPropEditor