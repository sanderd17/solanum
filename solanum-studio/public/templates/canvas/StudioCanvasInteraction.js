
import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import SelectionRect from "/templates/canvas/SelectionRect.js"

class StudioCanvasInteraction extends Template {

    init() {
        this.canvasPreview = null
        this.currentSelection = []
        this.setChildren({})

        this.eventHandlers.click = (ev) => this.setSelection([], ev)
        this.eventHandlers.dragstart = (ev) => {console.log('START DRAG SELECT');this.startedDrag = ev}
        this.eventHandlers.dragend = (ev) => this.endSelectionDrag(this.startedDrag, ev)
        this.addEventHandlersToDom()
        this.dom.setAttribute('draggable', true)
    }

    reloadSelectionRects() {
        // draw a rect for every child of the previewed component
        for (let child of this.dom.childNodes)
            this.dom.removeChild(child)

        let children = {
            '#multiSelectRect': new SelectionRect({
                position: {left:0, width: 0, top: 0, height: 0},
                props: {},
                eventHandlers: {
                    click: (ev) => {ev.stopPropagation()},
                    dragstart: (ev) => this.startedDrag = ev,
                    dragend: (ev) => this.endComponentDrag(this.startedDrag, ev),
                }
            })
        }
        for (let [id, cmp] of Object.entries(this.parent.children.preview.children)) {
            children[id] = new SelectionRect({
                position: cmp.position,
                props: {},
                eventHandlers: {
                    click: (ev) => this.setSelection([id], ev),
                    dragstart: (ev) => this.startedDrag = ev,
                    dragend: (ev) => this.endComponentDrag(this.startedDrag, ev),
                },
            })
        }
        this.setChildren(children)
        this.setId(this.id)
    }

    /**
     * @param {Array<string>} selection
     * @param {Event} ev
     */
    setSelection(selection, ev) {
        ev.stopPropagation()
        if (this.currentSelection.length > 1 && selection.length <= 1) {
            // there were multiple objects selected, hide the multi select rect again
            this.children['#multiSelectRect'].props.selected = false
            this.children['#multiSelectRect'].setPosition({left:0, width: 0, top: 0, height: 0})
        }
        this.currentSelection = selection
        if (selection.length <= 1) {
            // single or no child selected, use their own selection rects
            for (let [id, child] of Object.entries(this.children)) {
                child.props.selected = selection.includes(id)
            }
        } else {
            // Set selection to multiple elements
            let {left: cmpLeft, top: cmpTop} = this.dom.getBoundingClientRect()

            // Warning: right and bottom have different meanings here; it's measured from the left top of the page
            let {left: minLeft, top: minTop, right: maxRight, bottom: maxBottom} = this.children[selection[0]].dom.getBoundingClientRect()
            for (let id of selection) {
                let {left, top, right, bottom} = this.children[id].dom.getBoundingClientRect()
                console.log({left, top, right, bottom})
                minLeft = Math.min(left, minLeft)
                maxRight = Math.max(right, maxRight)
                minTop = Math.min(top, minTop)
                maxBottom = Math.max(bottom, maxBottom)
            }
            this.children['#multiSelectRect'].setPosition({
                left: (minLeft - cmpLeft) + 'px',
                width: (maxRight - minLeft) + 'px',
                top: (minTop - cmpTop) + 'px',
                height: (maxBottom - minTop) + 'px',
            })
            for (let [id, child] of Object.entries(this.children)) {
                if (id == '#multiSelectRect') {
                    child.props.selected = true
                } else {
                    child.props.selected = false
                }
            }
        }
    }

    /**
     * @param {string} id
     * @param {DragEvent} startDrag 
     * @param {DragEvent} endDrag 
     */
    async endComponentDrag(startDrag, endDrag) {
        endDrag.stopPropagation()
        let xDiff = endDrag.x - startDrag.x
        let yDiff = endDrag.y - startDrag.y

        for (let id of this.currentSelection) {
            console.log(id)
            let child = this.children[id]
            let newPosition = {}
            for (let [k, v] of Object.entries(child.position)) {
                let {unit, magnitude, factorVer, factorHor} = this.getCoordinateInfo(v)
                if (k == 'left' || k == 'right') {
                    magnitude = (parseInt(magnitude) + xDiff * factorHor).toString()
                }
                if (k == 'top' || k == 'bottom') {
                    magnitude = (parseInt(magnitude) + yDiff * factorVer).toString()
                }

                newPosition[k] = magnitude + unit
            }
            await this.setChildPosition(id, newPosition)
        }
        this.setSelection(this.currentSelection, endDrag)
    }

    /**
     * @param {DragEvent} startDragEvent 
     * @param {DragEvent} endDragEvent 
     */
    endSelectionDrag(startDragEvent, endDragEvent) {
        let selectedElements = []
        let selRect = {
            left:   Math.min(startDragEvent.x, endDragEvent.x),
            right:  Math.max(startDragEvent.x, endDragEvent.x),
            top:    Math.min(startDragEvent.y, endDragEvent.y),
            bottom: Math.max(startDragEvent.y, endDragEvent.y),
        }
        for (let [id, child] of Object.entries(this.children)) {
            let childRect = child.dom.getBoundingClientRect()
            if (
                selRect.left   < childRect.right  &&
                selRect.right  > childRect.left   &&
                selRect.top    < childRect.bottom &&
                selRect.bottom > childRect.top
            ) {
                // selection rect and child rect have overlap
                selectedElements.push(id)
            } 
        }
        this.setSelection(selectedElements, endDragEvent)
    }

    getCoordinateInfo(value) {
        let {width, height} = this.dom.getBoundingClientRect()
        let re = /(?<magnitude>[\-\d\.]*)(?<unit>[\w%]*)/u;
        let {magnitude, unit} = re.exec(value).groups
        let factorHor = 1
        let factorVer = 1
        if (unit == '%') {
            factorHor = 100 / width
            factorVer = 100 / height
        } else if (unit == 'px' || unit == '') {
            // default
        } else {
            console.error(`Unit '${unit} isn't implemented yet`)
        }
        return {unit, magnitude, factorVer, factorHor}
    }

    async setChildPosition(childId, newPosition) {
        this.children[childId].setPosition(newPosition)
        this.parent.children.preview.children[childId].setPosition(newPosition)
        console.log(this.parent.children.preview.children[childId])


        let newCode = await fetch('/API/studio/setChildPosition', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'same-origin', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({
                module: 'main',
                component: 'Motor.js',
                childId: childId,
                position: newPosition,
            }), // body data type must match "Content-Type" header
        })
        // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
    }
}

export default StudioCanvasInteraction