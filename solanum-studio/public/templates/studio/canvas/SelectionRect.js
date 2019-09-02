import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Rect from '/templates/draw/Rect.js'
import ResizeHandle from '/templates/studio/canvas/ResizeHandle.js'


class SelectionRect extends Template {

    children = {
        rect: new Rect({
            parent: this,
            position: {left: "0%", width: "100%", top: "0%", height: "100%"},
            props: {
                'stroke-dasharray': '1 4',
            },
            eventHandlers: {},
        }),
        topLeftHandle: new ResizeHandle({
            parent: this,
            position: {left: "0%", width: "4px", top: "0%", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['left', 'top'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['left', 'top'], root.startedDrag, ev),
            },
        }),
        topHandle: new ResizeHandle({
            parent: this,
            position: {left: "calc(50% - 2px)", width: "4px", top: "0%", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['top'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['top'], root.startedDrag, ev),
            },
        }),
        topRightHandle:new ResizeHandle({
            parent: this,
            position: {right: "0%", width: "4px", top: "0%", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['right', 'top'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['right', 'top'], root.startedDrag, ev),
            },
        }),
        rightHandle: new ResizeHandle({
            parent: this,
            position: {right: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['right'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['right'], root.startedDrag, ev),
            },
        }),
        bottomRightHandle: new ResizeHandle({
            parent: this,
            position: {right: "0%", width: "4px", bottom: "0%", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['right', 'bottom'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['right', 'bottom'], root.startedDrag, ev),
            },
        }),
        bottomHandle: new ResizeHandle({
            parent: this,
            position: {left: "calc(50% - 2px)", width: "4px", bottom: "0%", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['bottom'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['bottom'], root.startedDrag, ev),
            },
        }),
        bottomLeftHandle: new ResizeHandle({
            parent: this,
            position: {left: "0%", width: "4px", bottom: "0%", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['left', 'bottom'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['left', 'bottom'], root.startedDrag, ev),
            },
        }),
        leftHandle: new ResizeHandle({
            parent: this,
            position: {left: "0%", width: "4px", top: "calc(50% - 2px)", height: "4px"},
            props: {
                'visible': false,
            },
            eventHandlers: {
                dragstart: (ev, root) => root.startHandleDrag(ev),
                drag: (ev, root) => root.endHandleDrag(['left'], root.startedDrag, ev, true),
                dragend: (ev, root) => root.endHandleDrag(['left'], root.startedDrag, ev),
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
    
    _selected = false
    set selected(selected) {
        this._selected = selected
        this.__dom.setAttribute('draggable', selected)
        this.__dom.style['z-index'] = selected ? 1 : 0 // raise selection rect when selected
        this.classList.toggle('selected', selected)

        // Set all handles visible
        for (let childId in this.children) {
            if (childId.endsWith('Handle')) {
                this.children[childId].visible = selected
            }
        }
        this.children.rect.strokeDasharray = selected ? 'none' : '1 4'
    }

    get selected() {
        return this._selected
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
        await this.__parent.endHandleDrag(directions, startDragEv, endDragEv, previewOnly)
    }
}

export default SelectionRect