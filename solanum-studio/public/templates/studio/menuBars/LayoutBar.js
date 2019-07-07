
import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import ToggleButton from '/templates/forms/ToggleButton.js'

class LayoutBar extends Template {

    static childDefinitions = {
        icon: {
            type: ToggleButton,
            position: {
                left: "0px",
                width: "20px",
                top: "0px",
                height: "20px"
            },
            props: {
                selected: false,
            },
            eventHandlers: {
                click: (ev, root, child) => {
                    if (child.selected) {
                        root.parent.positionUnit = 'px'
                    } else {
                        root.parent.positionUnit = '%'
                    }
                }
            },
            styles: []
        },
    }

    set positionUnit(positionUnit) {
        this.dynamicFields.positionUnit = positionUnit
        this.children.icon.text = positionUnit
    }

    get positionUnit() {
        return this.dynamicFields.positionUnit
    }

    static defaultProps = {
        positionUnit: 'Px'
    }

    static defaultSize = [20, 20]
}

export default LayoutBar