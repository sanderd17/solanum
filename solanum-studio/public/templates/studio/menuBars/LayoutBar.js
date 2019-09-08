import Template from "/lib/template.js"
import ToggleButton from '/templates/forms/ToggleButton.js'
import solanum from "/lib/solanum.js"

class LayoutBar extends Template {

    children = {
        unitToggle: new ToggleButton({
            parent: this,
            position: {
                left: "0px",
                width: "20px",
                top: "0px",
                height: "20px"
            },
            props: {
                selected: false,
                text: '%'
            },
            eventHandlers: {
                click: (ev, root, child) => {
                    if (child.selected) {
                        root.positionUnit = 'px'
                    } else {
                        root.positionUnit = '%'
                    }
                }
            },
        }),
        test: new ToggleButton({
            parent: this,
            position: {left: '20px', width: '20px', height: '20px', top: '0px'},
            props: {text: 'T'},
            eventHandlers: {
                click: (ev) => {
                    solanum.openPopup('studio/propEditor/PositionPropEditor.js', {})
                    console.log('clicked')
                }
            }
        })
    }

    _positionUnit = '%'
    set positionUnit(positionUnit) {
        this._positionUnit = positionUnit
        this.children.unitToggle.text = positionUnit
    }

    get positionUnit() {
        return this._positionUnit
    }

    static defaultSize = [20, 20]
}

export default LayoutBar