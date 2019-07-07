
import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import SelectionRect from "/templates/studio/canvas/SelectionRect.js"

class StudioCanvasInteraction extends Template {

    constructor(...args) {
        super(...args)
        this.canvasPreview = null
        /** @type Array<string> */
        this.currentSelection = []

        this.eventHandlers.click = (ev) => this.setSelection([], ev)
        this.eventHandlers.dragstart = (ev) => this.startedDrag = ev
        this.eventHandlers.dragend = (ev) => this.endSelectionDrag(this.startedDrag, ev)
        this.eventHandlers.drop = (ev) => this.newComponentDrop(ev)
        // prevent default drag action to allow drop
        this.eventHandlers.dragover = (ev) => ev.preventDefault() 
        this.eventHandlers.dragenter = (ev) => ev.preventDefault()
        this.eventHandlers.keydown = (ev) => {
            if (ev.code == 'Delete')
                this.removeSelectedChildren(ev)
        }
        this.addEventHandlersToDom()
        this.dom.setAttribute('draggable', true) // draggable is required to allow selection drag
        this.dom.setAttribute('tabindex', 0) // Tabindex is required to register keydown events
    }

    /**
     * Reload this component when it has to represent the positions
     * of a different component
     */
    reloadSelectionRects() {
        // draw a rect for every child of the previewed component
        let children = {
            '#multiSelectRect': {
                type: SelectionRect,
                position: {left:0, width: 0, top: 0, height: 0},
                props: {},
                eventHandlers: {
                    click: (ev) => {ev.stopPropagation()},
                    dragstart: (ev) => this.startedDrag = ev,
                    dragend: (ev) => this.endComponentDrag(this.startedDrag, ev),
                }
            }
        }
        for (let [id, cmp] of Object.entries(this.parent.children.preview.children)) {
            children[id] = {
                type: SelectionRect,
                position: cmp.position,
                props: {},
                eventHandlers: {
                    click: (ev, root) => root.setSelection([id], ev),
                    dragstart: (ev, root) => root.startedDrag = ev,
                    dragend: (ev, root) => root.endComponentDrag(root.startedDrag, ev),
                },
            }
        }
        console.log(children)
        this.setChildren(children)
        this.setId(this.id)
    }

    /**
     * Add a new child component to this one
     * @param {DragEvent} ev 
     */
    async newComponentDrop(ev) {
        let newComponent = ev.dataTransfer.getData('newComponent')
        let newModule = ev.dataTransfer.getData('module')
        if (!newComponent || !newModule)
            return

        let childId = window.prompt("Element Id","")
        if (!childId)
            return

        if (childId in this.children) {
            alert("Id already exists!")
            return
        }
        
        console.log(ev)

        // Load new component
        const childPath = `/templates/${newComponent}`
        const moduleNewCmp = await import(childPath)
        const clsNewCmp = moduleNewCmp.default



        let unit = this.parent.parent.positionUnit
        let [width, height] = clsNewCmp.defaultSize
        if (unit == '%') {
            let {width: parentWidth, height: parentHeight} = this.dom.getBoundingClientRect()
            width *= 100 / parentWidth
            height *= 100 / parentHeight
        }

        // TODO support default alignment, currently always top-left aligned
        let position = {
            left: ev.offsetX + unit,
            top: ev.offsetY + unit,
            width: clsNewCmp.defaultSize[0] + unit,
            height: clsNewCmp.defaultSize[1] + unit,
        }

        let childDefinition = {
            type: clsNewCmp,
            position,
            props: {},
            eventHandlers: {},
            styles: [],
        }
        this.parent.addNewChild(childId,childDefinition)

        let newCode = this.callApi('addChildComponent', {
            childId,
            childClassName: clsNewCmp.name, 
            childPath,
            position,
        })
    }

    async removeSelectedChildren(ev) {
        console.log(ev)
        let newCode = await this.callApi('removeChildComponents', {childIds: this.currentSelection})
        this.parent.removeChildren(this.currentSelection)
        this.reloadSelectionRects()
    }

    /**
     * @param {Array<string>} selection
     * @param {Event} ev
     */
    setSelection(selection, ev) {
        ev.stopPropagation()
        if (this.currentSelection.length > 1 && selection.length <= 1) {
            // there were multiple objects selected, hide the multi select rect again
            this.children['#multiSelectRect'].selected = false
            this.children['#multiSelectRect'].setPosition({left:0, width: 0, top: 0, height: 0})
        }
        this.currentSelection = selection
        if (selection.length <= 1) {
            // single or no child selected, use their own selection rects
            for (let [id, child] of Object.entries(this.children)) {
                child.selected = selection.includes(id)
            }
        } else {
            // Set selection to multiple elements
            let {left: cmpLeft, top: cmpTop} = this.dom.getBoundingClientRect()

            // Warning: right and bottom have different meanings here; it's measured from the left top of the page
            let {left: minLeft, top: minTop, right: maxRight, bottom: maxBottom} = this.children[selection[0]].dom.getBoundingClientRect()
            for (let id of selection) {
                let {left, top, right, bottom} = this.children[id].dom.getBoundingClientRect()
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
                    child.selected = true
                } else {
                    child.selected = false
                }
            }
        }
        this.parent.setSelection(selection)
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
        // set selection again to update selection rect
        this.setSelection(selectedElements, endDragEvent)
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

        for (let childId of this.currentSelection) {
            let child = this.children[childId]
            let newPosition = {}
            for (let [k, v] of Object.entries(child.position)) {
                let {unit, magnitude, factorVer, factorHor} = this.getCoordinateInfo(v)
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
                    magnitude = (parseInt(magnitude) + yDiff * factorVer).toString()
                } else if (k == 'height' && directions.includes('top')) {
                    // dragging up on top handle enlarges area, dragging down shrinks
                    magnitude = (parseInt(magnitude) - yDiff * factorVer).toString()
                } else if (k == 'height' && directions.includes('bottom')) {
                    // dragging left on right handle shrinks area, dragging right enlarges
                    magnitude = (parseInt(magnitude) + yDiff * factorVer).toString()
                }

                newPosition[k] = magnitude + unit
            }
            await this.setChildPosition(childId, newPosition)
        }
        this.setSelection(this.currentSelection, endDragEv)
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

        let newCode = await this.callApi('setChildPosition', {
            childId: childId,
            position: newPosition,
        })
        // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
    }

    /**
     * Call an api function on the studio API
     * @param {string} apiFunction  function name of the Studio API
     * @param  {object} args any additional arguments to send to the body
     */
    async callApi(apiFunction, args) {
        // TODO don't hard-code current module
        let body = {
            module: 'main',
            component: 'Motor.js',
        }
        for (let [key, value] of Object.entries(args)) {
            body[key] = value
        }
        return await fetch(`/API/studio/${apiFunction}`, {
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
            body: JSON.stringify(body), // body data type must match "Content-Type" header
        })
    }

}

export default StudioCanvasInteraction