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

    static childStyles = {
        preview: [{
            declarations: {
                'background-color': '#FFFFFF'
            }
        }]
    }

    constructor(...args) {
        super(...args)
        this.init()
        this.cnt = 1
    }

    async setComponent(mod, cmp) {
        console.log(`Set component to ${mod}:${cmp}`)
        // load the module from the Studio API
        // cnt ensures a reload by using a different URL
        this.removeChild('preview')
        this.removeChild('interaction')
        this.cnt++
        try {
            let mdl = await import(`/API/Studio/openComponent?module=${mod}&component=${cmp}&v=${this.cnt}`)

            // cls is the class of the template that we'er going to edit
            let cls = mdl.default

            let [width, height] = cls.defaultSize
            this.addChild('preview', new cls({
                parent: this,
                position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            }))


            this.addChild('interaction', new StudioCanvasInteraction({
                parent: this,
                position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
                properties: {elWidth: `'${width}'`, elHeight: `'${height}'`},
                eventHandlers: {
                    childpositionchanged: (ev) => this.setChildPosition(ev.detail.childId, ev.detail.newPosition, ev.detail.previewOnly),
                    droppedchild: (ev, root) => root.addNewChild(ev.detail.childId, {
                        type: ev.detail.type,
                        position: ev.detail.position,
                    }),
                    deletedchildren: (ev, root) => root.removeChildren(ev.detail.childIds)
                },
            }))

            this.children.preview.disableEventHandlers()
            this.children.interaction.reloadSelectionRects()
        } catch (e) {
            console.error(`Error while loading component ${cmp} from module ${mod}:`)
            console.error(e)
        }
    }

    addNewChild(id, childDefinition) {
        this.children.preview.addChild(id, childDefinition)

        this.children.interaction.reloadSelectionRects()
    }

    setChildPosition(id, newPosition, previewOnly=false) {
        console.log(newPosition)
        this.children.preview.children[id].setPosition(newPosition)
        if (previewOnly) {
            this.children.interaction.hidden = true
        } else {
            this.children.interaction.hidden = false
            this.children.interaction.children[id].setPosition(newPosition)
        }
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


export default StudioCanvas