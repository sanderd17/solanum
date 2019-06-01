
import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import SelectionRect from "/templates/canvas/SelectionRect.js"

class StudioCanvasInteraction extends Template {

    init() {
        this.canvasPreview = null
        this.setChildren({})
    }

    reloadSelectionRects() {
        // draw a rect for every child of the previewed component
        for (let child of this.dom.childNodes)
            this.dom.removeChild(child)

        let children = {}
        for (let [id, cmp] of Object.entries(this.parent.children.preview.children)) {
            children[id] = new SelectionRect({
                position: cmp.position,
                //props: {selected: P.Raw(false), elWidth: P.Raw(this.props.elWidth), elHeight: P.Raw(this.props.elHeight)},
                props: {},
                eventHandlers: {
                    click: (ev, child) => {
                        child.props.selected = !child.props.selected
                        // TODO child should be able te react on prop change to maintain own dom
                        child.dom.setAttribute('draggable', child.props.selected)
                    },
                    dragstart: (ev) => {this.startedDrag = ev},
                    dragend: (ev) => {this.endDrag(id, this.startedDrag, ev)},
                },
            })
        }
        this.setChildren(children)
        this.setId(this.id)
    }

    /**
     * @param {string} id
     * @param {DragEvent} startDrag 
     * @param {DragEvent} endDrag 
     */
    endDrag(id, startDrag, endDrag) {
        let child = this.children[id]
        let xDiff = endDrag.x - startDrag.x
        let yDiff = endDrag.y - startDrag.y

        let re = /(?<magnitude>[\-\d\.]*)(?<unit>[\w%]*)/u;
        console.log(child.position)
        let newPosition = {}
        for (let [k, v] of Object.entries(child.position)) {
            let {magnitude, unit} = re.exec(v).groups
            // TODO convert unit into pixels and back
            if (k == 'left' || k == 'right') {
                magnitude = (parseInt(magnitude) + xDiff).toString()
            }
            if (k == 'top' || k == 'bottom') {
                magnitude = (parseInt(magnitude) + yDiff).toString()
            }

            newPosition[k] = magnitude + unit
        }
        child.setPosition(newPosition)
        this.parent.children.preview.children[id].setPosition(newPosition)
        console.log(this.parent.children.preview.children[id])
    }
}

export default StudioCanvasInteraction