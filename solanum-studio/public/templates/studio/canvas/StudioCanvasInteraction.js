
import Template from "/lib/template.js"
import SelectionRect from "/templates/studio/canvas/SelectionRect.js"

class StudioCanvasInteraction extends Template {

    constructor(...args) {
        super(...args)
        /** @type Array<string> */

        this.__eventHandlers.click = (ev) => {ev.stopPropagation(); this.selection = []}
        this.__eventHandlers.dragstart = (ev) => this.startedDrag = ev
        this.__eventHandlers.dragend = (ev) => this.endSelectionDrag(this.startedDrag, ev)
        this.__eventHandlers.drop = (ev) => this.newComponentDrop(ev)
        // prevent default drag action to allow drop
        this.__eventHandlers.dragover = (ev) => ev.preventDefault() 
        this.__eventHandlers.dragenter = (ev) => ev.preventDefault()
        this.__eventHandlers.keydown = (ev) => {
            if (ev.code == 'Delete')
                this.removeSelectedChildren(ev)
        }
        this.addEventHandlers()
        this.__dom.setAttribute('draggable', true) // draggable is required to allow selection drag
        this.__dom.setAttribute('tabindex', 0) // Tabindex is required to register keydown events
    }

    /**
     * Reload this component when it has to represent the positions
     * of a different component
     */
    reloadSelectionRects() {
        // draw a rect for every child of the previewed component
        this.children = {
            '#multiSelectRect': new SelectionRect({
                parent: this,
                position: {left:0, width: 0, top: 0, height: 0},
                props: {},
                eventHandlers: {
                    click: (ev) => {ev.stopPropagation()},
                    dragstart: (ev) => this.startedDrag = ev,
                    drag: (ev, root) => root.endComponentDrag(root.startedDrag, ev, true),
                    dragend: (ev) => this.endComponentDrag(this.startedDrag, ev),
                }
            })
        }
        for (let [id, cmp] of Object.entries(this.__parent.children.preview.children)) {
            this.children[id] = new SelectionRect({
                parent: this,
                position: cmp.__position,
                props: {},
                eventHandlers: {
                    click: (ev, root) => {ev.stopPropagation(); root.selection = [id]},
                    dragstart: (ev, root) => root.startedDrag = ev,
                    drag: (ev, root) => root.endComponentDrag(root.startedDrag, ev, true),
                    dragend: (ev, root) => root.endComponentDrag(root.startedDrag, ev),
                },
            })
        }
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

        this.dom.dispatchEvent(new CustomEvent('droppedchild', {
            bubbles: true,
            detail: {
                childId,
                type: clsNewCmp,
                childClassName: clsNewCmp.name, 
                childPath,
                position,
            }
        }))
    }

    async removeSelectedChildren(ev) {
        this.dom.dispatchEvent(new CustomEvent('deletedchildren', {
            bubbles: true,
            detail: {childIds: this.selection}
        }))
        this.reloadSelectionRects()
    }

    updateSelectionDraw() {
        if (this.selection.length <= 1) {
            // single or no child selected, use their own selection rects
            for (let [id, child] of Object.entries(this.children)) {
                child.selected = this.selection.includes(id)
            }
        } else {
            // Set selection to multiple elements
            let {left: cmpLeft, top: cmpTop} = this.__dom.getBoundingClientRect()

            // Warning: right and bottom have different meanings here; it's measured from the left top of the page
            let {left: minLeft, top: minTop, right: maxRight, bottom: maxBottom} = this.children[this.selection[0]].__dom.getBoundingClientRect()
            for (let id of this.selection) {
                let {left, top, right, bottom} = this.children[id].__dom.getBoundingClientRect()
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
    }

    _selection = []
    /**
     * @param {Array<string>} selection
     */
    set selection(selection) {
        if (this._selection.length > 1 && selection.length <= 1) {
            // there were multiple objects selected, hide the multi select rect again
            this.children['#multiSelectRect'].selected = false
            this.children['#multiSelectRect'].setPosition({left:0, width: 0, top: 0, height: 0})
        }
        this._selection = selection
        this.updateSelectionDraw()
        this.__dom.dispatchEvent(new CustomEvent('selectionchanged', {
            bubbles: true,
            detail: {selection}
        }))
    }

    get selection() {
        return this._selection
    }


    /**
     * @param {DragEvent} startDrag 
     * @param {DragEvent} endDrag 
     */
    async endComponentDrag(startDrag, endDrag, previewOnly=false) {
        endDrag.stopPropagation()
        let xDiff = endDrag.x - startDrag.x
        let yDiff = endDrag.y - startDrag.y

        for (let id of this.selection) {
            let child = this.children[id]
            let newPosition = {}
            for (let [k, v] of Object.entries(child.__position)) {
                let {unit, magnitude, factorVer, factorHor} = this.getCoordinateInfo(v)
                if (k == 'left' || k == 'right') {
                    magnitude = (parseInt(magnitude) + xDiff * factorHor).toString()
                }
                if (k == 'top' || k == 'bottom') {
                    magnitude = (parseInt(magnitude) + yDiff * factorVer).toString()
                }

                newPosition[k] = magnitude + unit
            }
            this.setChildPosition(id, newPosition, previewOnly)
        }
        if (!previewOnly) {
            // move the selected rects
            this.updateSelectionDraw()
        }
    }

    /**
     * @param {DragEvent} startDragEvent 
     * @param {DragEvent} endDragEvent 
     */
    endSelectionDrag(startDragEvent, endDragEvent) {
        endDragEvent.stopPropagation()
        let selectedElements = []
        let selRect = {
            left:   Math.min(startDragEvent.x, endDragEvent.x),
            right:  Math.max(startDragEvent.x, endDragEvent.x),
            top:    Math.min(startDragEvent.y, endDragEvent.y),
            bottom: Math.max(startDragEvent.y, endDragEvent.y),
        }
        for (let [id, child] of Object.entries(this.children)) {
            let childRect = child.__dom.getBoundingClientRect()
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
        this.selection = selectedElements
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

        for (let childId of this.selection) {
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
            this.setChildPosition(childId, newPosition)
        }
        // move the selected rects
        this.updateSelectionDraw()
    }

    getCoordinateInfo(value) {
        let {width, height} = this.__dom.getBoundingClientRect()
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

    setChildPosition(childId, newPosition, previewOnly=false) {
        this.__dom.dispatchEvent(new CustomEvent('childpositionchanged', {
            bubbles: true,
            detail: {childId, newPosition, previewOnly}
        }))
    }
}

export default StudioCanvasInteraction