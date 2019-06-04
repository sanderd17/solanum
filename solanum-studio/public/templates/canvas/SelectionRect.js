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
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['left', 'top'], this.startedDrag, ev),
                }
            }),
            topHandle: new ResizeHandle({
                position: {left: "calc(50% - 2px)", width: "4px", top: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['top'], this.startedDrag, ev),
                }
            }),
            topRightHandle: new ResizeHandle({
                position: {right: "0%", width: "4px", top: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['right', 'top'], this.startedDrag, ev),
                }
            }),
            rightHandle: new ResizeHandle({
                position: {right: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
                props: {
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['right'], this.startedDrag, ev),
                }
            }),
            bottomRightHandle: new ResizeHandle({
                position: {right: "0%", width: "4px", bottom: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['right', 'bottom'], this.startedDrag, ev),
                }
            }),
            bottomHandle: new ResizeHandle({
                position: {left: "calc(50% - 2px)", width: "4px", bottom: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['bottom'], this.startedDrag, ev),
                }
            }),
            bottomLeftHandle: new ResizeHandle({
                position: {left: "0%", width: "4px", bottom: "0%", height: "4px"},
                props: {
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['left', 'bottom'], this.startedDrag, ev),
                }
            }),
            leftHandle: new ResizeHandle({
                position: {left: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
                props: {
                    'visible': P.Bound('selected'),
                },
                eventHandlers: {
                    dragstart: (ev) => this.startHandleDrag(ev),
                    dragend: (ev) => this.endHandleDrag(['left'], this.startedDrag, ev),
                }
            }),
        })

        this.setPropListener('selected', s => {
            this.dom.setAttribute('draggable', s)
            this.dom.style['z-index'] = s ? 1 : 0 // raise selection rect when selected
        })
    }

    startHandleDrag(ev) {
        this.startedDrag = ev
    }

    /**
     * 
     * @param {Array<string>} directions
     * @param {DragEvent} startDragEv 
     * @param {DragEvent} endDragEv 
     */
    async endHandleDrag(directions, startDragEv, endDragEv) {
        endDragEv.stopPropagation()
        let xDiff = endDragEv.x - startDragEv.x
        let yDiff = endDragEv.y - startDragEv.y

        let newPosition = {}
        for (let [k, v] of Object.entries(this.position)) {
            let {unit, magnitude, factorVer, factorHor} = this.parent.getCoordinateInfo(v)
            if ((k == 'left' || k == 'right') && directions.includes(k)) {
                // dragging left or right, when aligned as such, just repositions the handle
                magnitude = (parseInt(magnitude) + xDiff * factorHor).toString()
            } else if (k == 'width' && directions.includes('left')) {
                // dragging left on left handle enlarges area, dragging right shrinks
                magnitude = (parseInt(magnitude) - xDiff * factorHor).toString()
            } else if (k == 'width' && directions.includes('right')) {
                // dragging left on right handle shrinks area, dragging right enlarges
                magnitude = (parseInt(magnitude) + xDiff * factorHor).toString()
            }
            if ((k == 'top' || k == 'bottom') && directions.includes(k)) {
                // dragging top or bottom, when aligned as such, just repositions the handle
                magnitude = (parseInt(magnitude) + yDiff * factorHor).toString()
            } else if (k == 'height' && directions.includes('top')) {
                // dragging up on top handle enlarges area, dragging down shrinks
                magnitude = (parseInt(magnitude) - yDiff * factorHor).toString()
            } else if (k == 'height' && directions.includes('bottom')) {
                // dragging left on right handle shrinks area, dragging right enlarges
                magnitude = (parseInt(magnitude) + yDiff * factorHor).toString()
            }

            newPosition[k] = magnitude + unit
        }
        console.log(newPosition)
        await this.parent.setChildPosition(this.id.split('.').pop(), newPosition)
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