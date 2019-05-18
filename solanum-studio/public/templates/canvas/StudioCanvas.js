import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvasInteraction from '/templates/canvas/StudioCanvasInteraction.js'

class StudioCanvas extends Template {
    init() {
        this.setChildren({ })
    }

    async setComponent(mod, cmp) {
        console.log(`Set component to ${mod}:${cmp}`)
        // load the module from the Studio API
        let mdl = await import(`/API/Studio/openComponent?module=${mod}&component=${cmp}`)

        // cls is the class of the replaced template
        let cls = mdl.default

        // TODO get default size from class
        let position = {left: '0px', width: '100px', top:'0px', height:'100px'}
        let preview= new cls({
            position,
            props: {},
            eventHandlers: {}
        })

        preview.disableEventHandlers()

        let interaction= new StudioCanvasInteraction({
            position,
            props: {},
            eventHandlers: {}
        })

        this.setChildren({preview, interaction})
        console.log(this.id)
        this.setId(this.id)

        interaction.reloadSelectionRects()
    }
}

export default StudioCanvas