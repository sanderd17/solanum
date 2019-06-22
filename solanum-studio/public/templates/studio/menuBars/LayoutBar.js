
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
                selected: P.Raw(false),
                text: P.Bound('positionUnit'),
            },
            eventHandlers: {
                click: (ev, root, child) => {
                    if (child.props.selected) {
                        root.parent.props.positionUnit = 'px'
                    } else {
                        root.parent.props.positionUnit = '%'
                    }
                }
            },
            styles: []
        },
    }

    static defaultProps = {
        positionUnit: 'Px'
    }

    static defaultSize = [20, 20]
}

export default LayoutBar