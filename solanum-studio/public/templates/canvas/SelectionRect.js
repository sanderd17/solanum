import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'


class SelectionRect extends Template {
    init() {
        this.setChildren({
            rect: new Rect({
                position: {left: "0%", width: "100%", top: "0%", height: "100%"},
                props: {
                    'stroke-dasharray': P.Bound('selected', (s) => s ? 'none' : '1 4')
                },
                eventHandlers: {
                    click: (ev) => {
                        this.props.selected = !this.props.selected
                        this.dom.setAttribute('draggable', this.props.selected)
                    },
                }
            })
        })
    }
}

SelectionRect.prototype.defaultProps = {
    'selected': false
}

SelectionRect.prototype.css = {
    'rect': {
        'fill': 'none',
        'stroke': '#00008080',
        'stroke-width': '1px',
        'stroke-linecap': 'round',
    },
    'rect:hover': {
        'cursor': 'pointer',
        'stroke-width': '2px',
    },
}

export default SelectionRect