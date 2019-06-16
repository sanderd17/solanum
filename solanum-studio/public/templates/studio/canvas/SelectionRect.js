import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'
import ResizeHandle from '/templates/studio/canvas/ResizeHandle.js'


class SelectionRect extends Template {
    /* TODO style proposal
    childDefinitions = {
        rect: {
            type: Rect,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
            props: {
                'stroke-dasharray': P.Bound('selected', (s) => s ? 'none' : '1 4')
            },
            eventHandlers: {}
            styles: [
                {
                    declarations: {
                        'fill': 'none',
                        'stroke-linecap': 'round',
                    }
                },
                {
                    classes: ['selected'],
                    declarations: {
                        'stroke-dasharray': '1 4',
                    }
                },
                {
                    states: ['hover'],
                    declarations: {
                        'cursor': 'pointer',
                        'stroke': '#00008080',
                        'stroke-width': '1px',
                    }
                },
            ]
        },
    }*/

    static childDefinitions = {
        rect: {
            type: Rect,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
            props: {
                'stroke-dasharray': P.Bound('selected', (s) => s ? 'none' : '1 4')
            },
            eventHandlers: {},
            styles: [
                {
                    declarations: {
                        'fill': 'none',
                        'stroke-linecap': 'round',
                    }
                },
                {
                    classes: ['selected'],
                    declarations: {
                        'stroke-dasharray': '1 4',
                    }
                },
                {
                    states: ['hover'],
                    declarations: {
                        'cursor': 'pointer',
                        'stroke': '#00008080',
                        'stroke-width': '1px',
                    }
                },
            ],
        },
        topLeftHandle: {
            type: ResizeHandle,
            position: {left: "0%", width: "4px", top: "0%", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['left', 'top'], root.startedDrag, ev),
            }
        },
        topHandle: {
            type: ResizeHandle,
            position: {left: "calc(50% - 2px)", width: "4px", top: "0%", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['top'], root.startedDrag, ev),
            }
        },
        topRightHandle:{
            type: ResizeHandle,
            position: {right: "0%", width: "4px", top: "0%", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['right', 'top'], root.startedDrag, ev),
            }
        },
        rightHandle: {
            type: ResizeHandle,
            position: {right: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['right'], root.startedDrag, ev),
            }
        },
        bottomRightHandle: {
            type: ResizeHandle,
            position: {right: "0%", width: "4px", bottom: "0%", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['right', 'bottom'], root.startedDrag, ev),
            }
        },
        bottomHandle: {
            type: ResizeHandle,
            position: {left: "calc(50% - 2px)", width: "4px", bottom: "0%", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['bottom'], root.startedDrag, ev),
            }
        },
        bottomLeftHandle: {
            type: ResizeHandle,
            position: {left: "0%", width: "4px", bottom: "0%", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['left', 'bottom'], root.startedDrag, ev),
            }
        },
        leftHandle: {
            type: ResizeHandle,
            position: {left: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
            props: {
                'visible': P.Bound('selected'),
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                dragend: (ev, root) => root.endHandleDrag(['left'], root.startedDrag, ev),
            }
        },
    }
    
    static defaultProps = {
        'selected': false
    }

    constructor(...args) {
        super(...args)

        this.setPropListener('selected', s => {
            this.dom.setAttribute('draggable', s)
            this.dom.style['z-index'] = s ? 1 : 0 // raise selection rect when selected
            this.classList.toggle('selected', s)
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
        await this.parent.endHandleDrag(directions, startDragEv, endDragEv)
    }
}

SelectionRect.prototype.css = {
    'rect': {
        'fill': 'none',
        //'stroke': '#00008080',
        //'stroke-width': '1px',
        'stroke-linecap': 'round',
    },
    'rect:hover': {
        'cursor': 'pointer',
        'stroke': '#00008080',
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