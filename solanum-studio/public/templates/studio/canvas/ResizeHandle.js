import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'


class ResizeHandle extends Template {
    childDefinitions = {
        icon: {
            type: Rect,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
            props: {},
            eventHandlers: {}
        }
    }
    constructor(...args) {
        super(...args)
        this.setChildren(this.childDefinitions)

        this.setPropListener('visible', v => {
            this.children.icon.classList.toggle('visible', v)
            this.dom.setAttribute('draggable', v)
            //this.dom.style['z-index'] = s ? 1 : 0 // raise selection rect when selected
        })
    }
}

ResizeHandle.prototype.defaultProps = {
    'visible': false
}

ResizeHandle.prototype.css = {
    'icon': {
        'visibility': 'hidden',
        'fill': '#000000',
    },
    'icon:hover': {
        'fill': '#0000A0',
    },
    'icon.visible': {
        'visibility': 'visible'
    }
}

export default ResizeHandle