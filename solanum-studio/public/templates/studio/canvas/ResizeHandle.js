import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'


class ResizeHandle extends Template {
    static childDefinitions = {
        icon: {
            type: Rect,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
            props: {},
            eventHandlers: {}
        }
    }

    _visible  = false
    set visible(visible) {
        this._visible = visible
        this.children.icon.classList.toggle('visible', visible)
        this.dom.setAttribute('draggable', visible)
    }
    get visible() {
        return this._visible
    }
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