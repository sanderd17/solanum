import Template from "/lib/template.js"
import ToggleButton from '/templates/forms/ToggleButton.js'
import solanum from "/lib/solanum.js"

import Prop from '/lib/ComponentProp.js'

class LayoutBar extends Template {

    properties = {
        positionUnit: new Prop('"%"')
    }

    constructor(...args) {
        super(...args)
        this.init()
    }

    children = {
        unitToggle: new ToggleButton({
            parent: this,
            position: {
                left: "0px",
                width: "20px",
                top: "0px",
                height: "20px"
            },
            properties: {
                selected: 'false',
                text: 'Prop("positionUnit")'
            },
            eventHandlers: {
                click: (ev, child) => {
                    this.prop.positionUnit = child.prop.selected ? 'px' : '%'
                }
            },
        }),
    }

    static defaultSize = [20, 20]
}

export default LayoutBar