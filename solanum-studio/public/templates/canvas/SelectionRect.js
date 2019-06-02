import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'
import ResizeHandle from '/templates/canvas/ResizeHandle.js'


class SelectionRect extends Template {
    init() {
        this.setChildren({
            rect: new Rect({
                position: {left: "0%", width: "100%", top: "0%", height: "100%"},
                props: {
                    'stroke-dasharray': P.Bound('selected', (s) => s ? 'none' : '1 4')
                },
                eventHandlers: {}
            }),
            topLeftHandle: new ResizeHandle({
                position: {left: "0%", width: "4px", top: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
            topHandle: new ResizeHandle({
                position: {left: "calc(50% - 2px)", width: "4px", top: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
            topRightHandle: new ResizeHandle({
                position: {right: "0%", width: "4px", top: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
            rightHandle: new ResizeHandle({
                position: {right: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
            bottomRightHandle: new ResizeHandle({
                position: {right: "0%", width: "4px", bottom: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
            bottomHandle: new ResizeHandle({
                position: {left: "calc(50% - 2px)", width: "4px", bottom: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
            bottomLeftHandle: new ResizeHandle({
                position: {left: "0%", width: "4px", bottom: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
            leftHandle: new ResizeHandle({
                position: {left: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
                props: {
                    'visible': P.Bound('selected')
                },
            }),
        })

        this.setPropListener('selected', s => {
            this.dom.setAttribute('draggable', s)
            this.dom.style['z-index'] = s ? 1 : 0 // raise selection rect when selected
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
        'stroke-width': '1px',
    },
    'topHandle': {
        'cursor': 'ns-resize'
    },
    'bottomHandle': {
        'cursor': 'ns-resize'
    },
    'leftHandle': {
        'cursor': 'ew-resize'
    },
    'rightHandle': {
        'cursor': 'ew-resize'
    },
    'topLeftHandle': {
        'cursor': 'nwse-resize'
    },
    'bottomRightHandle': {
        'cursor': 'nwse-resize'
    },
    'topRightHandle': {
        'cursor': 'nesw-resize'
    },
    'bottomLeftHandle': {
        'cursor': 'nesw-resize'
    },
}

export default SelectionRect