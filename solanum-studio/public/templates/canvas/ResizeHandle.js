import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'


class ResizeHandle extends Template {
    init() {
        this.setChildren({
            icon: new Rect({
                position: {left: "0%", width: "100%", top: "0%", height: "100%"},
                props: {},
                eventHandlers: {}
            })
        })

        this.setPropListener('visible', v => {
            this.children.icon.classList.toggle('visible', v)
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
        'fill': '#000080',
    },
    'icon.visible': {
        'visibility': 'visible'
    }
}

export default ResizeHandle