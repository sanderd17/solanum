import Template from "/lib/template.js"
import StudioCanvasInteraction from '/templates/studio/canvas/StudioCanvasInteraction.js'

class StudioCanvas extends Template {
    static styles = [
        {
            declarations: {
                'background-color': '#909090'
            }
        }
    ]

    constructor(...args) {
        super(...args)
        this.cnt = 1
    }

    async setComponent(mod, cmp) {
        console.log(`Set component to ${mod}:${cmp}`)
        // load the module from the Studio API
        // cnt ensures a reload by using a different URL
        let mdl = await import(`/API/Studio/openComponent?module=${mod}&component=${cmp}&v=${this.cnt}`)
        this.cnt++

        // cls is the class of the template that we'er going to edit
        let cls = mdl.default

        let [width, height] = cls.defaultSize
        let preview = {
            type: cls,
            position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            props: {},
            eventHandlers: {}
        }


        let interaction = {
            type: StudioCanvasInteraction,
            position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            props: {elWidth: width, elHeight: height},
            eventHandlers: {
                childpositionchanged: (ev, root) => root.setChildPosition(ev.detail.childId, ev.detail.newPosition),
                droppedchild: (ev, root) => root.addNewChild(ev.detail.childId, {
                    type: ev.detail.type,
                    position: ev.detail.position,
                    props: {},
                    eventHandlers: {},
                    styles: [],
                }),
                deletedchildren: (ev, root) => root.removeChildren(ev.detail.childIds)
            },
        }

        this.setChildren({preview, interaction})
        this.setId(this.id)
        this.children.preview.disableEventHandlers()

        this.children.interaction.reloadSelectionRects()
    }

    addNewChild(id, childDefinition) {
        this.children.preview.addChild(id, childDefinition)

        this.children.interaction.reloadSelectionRects()
    }

    setChildPosition(id, newPosition) {
        this.children.preview.children[id].setPosition(newPosition)
        this.children.interaction.children[id].setPosition(newPosition)
    }

    /**
     * @param { string[] } childIds
     */
    removeChildren(childIds) {
        for (let id of childIds) {
            this.children.preview.removeChild(id)
        }
    }
}

StudioCanvas.prototype.css = {
    'preview': {
        'background-color': '#FFFFFF'
    }
}

export default StudioCanvas