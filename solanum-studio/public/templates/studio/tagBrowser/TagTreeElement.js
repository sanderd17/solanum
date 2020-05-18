import Label from '/templates/forms/Label.js'
import Template from "/lib/template.js"
import Prop from '/lib/ComponentProp.js'

class TagTreeElement extends Template {

    constructor(args) {
        super(args)
        this.init()
    }

    properties = {
        text: new Prop("''"),
        tagpath: new Prop("''")
    }

    children = {
        label: new Label({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px'},
            properties: {
                text: "Prop('text')"
            },
            eventHandlers: {
                click: () => {
                    this.dispatchEvent('selectionchanged', {selection: this.prop.tagpath})
                }
            },
        })
    }
}

export default TagTreeElement