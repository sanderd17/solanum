import Template from "/lib/template.js"
import P from '/lib/Prop.js'

class TagBrowser extends Template {
    constructor(...args) {
        super(...args)
        this.setChildren(this.childDefinitions)
    }
}

TagBrowser.prototype.css = {
}

export default TagBrowser