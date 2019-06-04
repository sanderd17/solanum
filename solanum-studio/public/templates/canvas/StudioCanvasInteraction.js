
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
                props: {},
                eventHandlers: {
                    click: (ev, child) => child.props.selected = !child.props.selected,
                    dragstart: (ev) => this.startedDrag = ev,
                    dragend: (ev) => this.endComponentDrag(id, this.startedDrag, ev),
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
    async endComponentDrag(id, startDrag, endDrag) {
        let child = this.children[id]
        let xDiff = endDrag.x - startDrag.x
        let yDiff = endDrag.y - startDrag.y

        console.log(child.position)
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

    getCoordinateInfo(value) {
        let canvasWidth = this.props.elWidth
        let canvasHeight = this.props.elHeight
        let re = /(?<magnitude>[\-\d\.]*)(?<unit>[\w%]*)/u;
        let {magnitude, unit} = re.exec(value).groups
        let factorHor = 1
        let factorVer = 1
        if (unit == '%') {
            factorHor = 100 / canvasWidth
            factorVer = 100 / canvasHeight
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