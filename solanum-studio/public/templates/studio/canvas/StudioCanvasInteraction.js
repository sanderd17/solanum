
import Template from "/lib/template.js"
import Prop from '/lib/ComponentProp.js'
import SelectionRect from "/templates/studio/canvas/SelectionRect.js"

class StudioCanvasInteraction extends Template {

    constructor(...args) {
        super(...args)
        /** @type Array<string> */

        this.__eventHandlers.click = (ev) => {ev.stopPropagation(); this.properties.selection.value = []}
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
        this.init()
    }

    properties = {
        selection: new Prop('[]', (newSelection, oldSelection) => {
            if (oldSelection && oldSelection.length > 1 && newSelection.length <= 1) {
                // there were multiple objects selected, hide the multi select rect again
                this.children['#multiSelectRect'].selected = false
                this.children['#multiSelectRect'].setPosition({left:0, width: 0, top: 0, height: 0})
            }
            this.updateSelectionDraw()
        }),
    }

    /**
     * Reload this component when it has to represent the positions
     * of a different component
     */
    reloadSelectionRects() {
        for (let id in this.children) {
            this.removeChild(id)
        }
        // draw a rect for every child of the previewed component
        this.addChild('#multiSelectRect',
            new SelectionRect({
                parent: this,
                position: {left:0, width: 0, top: 0, height: 0},
                eventHandlers: {
                    click: (ev) => {ev.stopPropagation()},
                    dragstart: (ev) => this.startedDrag = ev,
                    drag: (ev, root) => root.endComponentDrag(root.startedDrag, ev, true),
                    dragend: (ev) => this.endComponentDrag(this.startedDrag, ev),
                }
            })
        )
        for (let [id, cmp] of Object.entries(this.__parent.children.preview.children)) {
            this.addChild(id, 
                new SelectionRect({
                    parent: this,
                    position: cmp.__position,
                    eventHandlers: {
                        click: (ev, root) => {
                            ev.stopPropagation()
                            this.dispatchEvent('selectionchanged', {selection: [id]})
                        },
                        dragstart: (ev, root) => root.startedDrag = ev,
                        drag: (ev, root) => root.endComponentDrag(root.startedDrag, ev, true),
                        dragend: (ev, root) => root.endComponentDrag(root.startedDrag, ev),
                    },
                })
            )
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

        this.dispatchEvent('droppedchild', {
            childId,
            type: clsNewCmp,
            childClassName: clsNewCmp.name, 
            childPath,
            position,
        })
    }

    async removeSelectedChildren(ev) {
        this.dispatchEvent('deletedchildren', {childIds: this.properties.selection.value})
        this.reloadSelectionRects()
    }

    updateSelectionDraw() {
        let selection = this.properties.selection.value
        if (selection.length <= 1) {
            // single or no child selected, use their own selection rects
            for (let [id, child] of Object.entries(this.children)) {
                child.properties.selected.value = selection.includes(id)
            }
        } else {
            // Set selection to multiple elements
            let {left: cmpLeft, top: cmpTop} = this.__dom.getBoundingClientRect()

            // Warning: right and bottom have different meanings here; it's measured from the left top of the page
            let {left: minLeft, top: minTop, right: maxRight, bottom: maxBottom} = this.children[selection[0]].__dom.getBoundingClientRect()
            for (let id of selection) {
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
                    child.properties.selected.value = true
                } else {
                    child.properties.selected.value = false
                }
            }
        }
    }

    /**
     * @param {DragEvent} startDrag 
     * @param {DragEvent} endDrag 
     */
    async endComponentDrag(startDrag, endDrag, previewOnly=false) {
        endDrag.stopPropagation()
        let xDiff = endDrag.x - startDrag.x
        let yDiff = endDrag.y - startDrag.y

        for (let id of this.properties.selection.value) {
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
        this.dispatchEvent('selectionchanged', {selection: selectedElements})
    }

    /**
     * 
     * @param {Array<string>} directions
     * @param {DragEvent} startDragEv 
     * @param {DragEvent} endDragEv 
     */
    async endHandleDrag(directions, startDragEv, endDragEv, previewOnly) {
        endDragEv.stopPropagation()
        let xDiff = endDragEv.x - startDragEv.x
        let yDiff = endDragEv.y - startDragEv.y

        for (let childId of this.properties.selection.value) {
            let child = this.children[childId]
            let newPosition = {}
            for (let [k, v] of Object.entries(child.__position)) {
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
            this.setChildPosition(childId, newPosition, previewOnly)
        }
        if (!previewOnly) {
            // move the selected rects
            this.updateSelectionDraw()
        }
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
        this.dispatchEvent('childpositionchanged', {childId, newPosition, previewOnly})
    }
}

export default StudioCanvasInteraction