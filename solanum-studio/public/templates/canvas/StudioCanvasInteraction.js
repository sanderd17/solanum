
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
            console.log(id)
            console.log(cmp.position)
            children[id] = new SelectionRect({
                position: cmp.position,
                props: {selected: P.Raw(false)},
                eventHandlers: {
                    click: (ev) => {
                        console.log("clicked")
                        this.children[id].props.selected = true
                    }
                },
            })
        }
        this.setChildren(children)
        this.setId(this.id)
    }
}

export default StudioCanvasInteraction