import Label from '/templates/forms/Label.js'
import Template from "/lib/template.js"
import Prop from '/lib/ComponentProp.js'
import solanum from '/lib/solanum.js'

class TagContextMenu extends Template {

    static defaultSize = [100, 100]

    constructor(args) {
        super(args)
        this.init()
    }

    properties = {
        text: new Prop('text'),
    }

    children = {
        label: new Label({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px'},
            properties: {
                text: ({Prop}) => Prop('text'),
            },
            eventHandlers: {
                click: () => {
                    console.log("CLICKED")
                    solanum.closeContextMenu()
                },
            },
        })
    }
}

export default TagContextMenu