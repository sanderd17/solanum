import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'


class ResizeHandle extends Template {
    props = {
        visible: false
    }

    children = {
        icon: new Rect({
            parent: this,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
            props: {},
            eventHandlers: {}
        })
    }

    static childStyles = {
        icon: [
            {
                declarations: {
                    'visibility': 'hidden',
                    'fill': '#000000',
                }
            },
            {
                classes: ['visible'],
                declarations: {
                    'visibility': 'inherit'
                }
            },
            {
                states: ['hover'],
                declarations: {
                    'fill': '#0000A0',
                }
            }
        ]
    }

    _visible  = false
    set visible(visible) {
        this._visible = visible
        this.classList.toggle('visible', visible)
        this.__dom.setAttribute('draggable', visible)
    }
    get visible() {
        return this._visible
    }
}

export default ResizeHandle