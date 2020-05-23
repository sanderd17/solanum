import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import Rect from '/templates/draw/Rect.js'

class ResizeHandle extends Template {
    constructor(args) {
        super(args)
        this.init()
    }

    properties = {
        visible: new Prop(false, (newValue) => {
            this.children.icon.classList.toggle('visible', newValue)
            this.dom.setAttribute('draggable', newValue)
        })
    }

    children = {
        icon: new Rect({
            parent: this,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
        })
    }

    static styles = {
        '>.icon': {
            'visibility': 'hidden',
            'fill': '#000000',
            '.visible': {
                'visibility': 'inherit'
            },
            ':hover': {
                'fill': '#0000A0',
            },
        }
    }
}

export default ResizeHandle