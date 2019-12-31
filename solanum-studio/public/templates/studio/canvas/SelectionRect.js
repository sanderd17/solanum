import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'
import ResizeHandle from '/templates/studio/canvas/ResizeHandle.js'


class SelectionRect extends Template {
    constructor(...args) {
        super(...args)
        this.init()
    }

    properties = {
        selected: new Prop("false", (newValue) => {
            this.dom.setAttribute('draggable', newValue)
            this.dom.style['z-index'] = newValue ? 1 : 0 // raise selection rect when selected
            this.classList.toggle('selected', newValue)

            // Set all handles visible
            for (let childId in this.children) {
                if (childId.endsWith('Handle')) {
                    this.children[childId].properties.visible.value = newValue
                }
            }
            this.children.rect.properties['stroke-dasharray'].value = newValue ? 'none' : '1 4'
        })
    }

    children = {
        rect: new Rect({
            parent: this,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
            properties: {
                'fill': '"#00000000"',
                'stroke-dasharray': '"1 4"',
            },
            eventHandlers: {},
        }),
        topLeftHandle: new ResizeHandle({
            parent: this,
            position: {left: "0%", width: "4px", top: "0%", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['left', 'top'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['left', 'top'], this.startedDrag, ev),
            },
        }),
        topHandle: new ResizeHandle({
            parent: this,
            position: {left: "calc(50% - 2px)", width: "4px", top: "0%", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['top'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['top'], this.startedDrag, ev),
            },
        }),
        topRightHandle:new ResizeHandle({
            parent: this,
            position: {right: "0%", width: "4px", top: "0%", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['right', 'top'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['right', 'top'], this.startedDrag, ev),
            },
        }),
        rightHandle: new ResizeHandle({
            parent: this,
            position: {right: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['right'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['right'], this.startedDrag, ev),
            },
        }),
        bottomRightHandle: new ResizeHandle({
            parent: this,
            position: {right: "0%", width: "4px", bottom: "0%", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['right', 'bottom'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['right', 'bottom'], this.startedDrag, ev),
            },
        }),
        bottomHandle: new ResizeHandle({
            parent: this,
            position: {left: "calc(50% - 2px)", width: "4px", bottom: "0%", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['bottom'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['bottom'], this.startedDrag, ev),
            },
        }),
        bottomLeftHandle: new ResizeHandle({
            parent: this,
            position: {left: "0%", width: "4px", bottom: "0%", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['left', 'bottom'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['left', 'bottom'], this.startedDrag, ev),
            },
        }),
        leftHandle: new ResizeHandle({
            parent: this,
            position: {left: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
            properties: {
                'visible': "false",
            },
            eventHandlers: {
                dragstart: (ev) => this.startHandleDrag(ev),
                drag: (ev) => this.endHandleDrag(['left'], this.startedDrag, ev, true),
                dragend: (ev) => this.endHandleDrag(['left'], this.startedDrag, ev),
            },
        }),
    }

    static childStyles = {
        rect: [
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
                    'stroke': '#00008080',
                    'stroke-width': '1px',
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
        topLeftHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'nwse-resize'
            }
        }],
        topHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'ns-resize'
            }
        }],
        topRightHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'nesw-resize'
            }
        }],
        rightHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'ew-resize'
            }
        }],
        bottomRightHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'nwse-resize'
            }
        }],
        bottomHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'ns-resize'
            }
        }],
        bottomLeftHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'nesw-resize'
            }
        }],
        leftHandle: [{
            classes: ['selected'],
            declarations: {
                'cursor': 'ew-resize'
            }
        }],
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
    async endHandleDrag(directions, startDragEv, endDragEv, previewOnly=false) {
        this.dispatchEvent('endHandleDrag', {directions, startDragEv, endDragEv, previewOnly})
    }
}

export default SelectionRect