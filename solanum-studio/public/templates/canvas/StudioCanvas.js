import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvasInteraction from '/templates/canvas/StudioCanvasInteraction.js'

class StudioCanvas extends Template {
    init() {
        this.setChildren({ })
        this.cnt = 1
    }

    async setComponent(mod, cmp) {
        console.log(`Set component to ${mod}:${cmp}`)
        // load the module from the Studio API
        let mdl = await import(`/API/Studio/openComponent?module=${mod}&component=${cmp}&v=${this.cnt}`)
        this.cnt++

        // cls is the class of the replaced template
        let cls = mdl.default

        // TODO get default size from class
        let width = 100
        let height = 100
        let preview= new cls({
            position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            props: {},
            eventHandlers: {}
        })

        preview.disableEventHandlers()

        let interaction= new StudioCanvasInteraction({
            position: {left: '0px', width: '100%', top: '0px', height: '100%'},
            props: {elWidth: P.Raw(width), elHeight: P.Raw(height)},
            eventHandlers: {}
        })

        this.setChildren({preview, interaction})
        console.log(this.id)
        this.setId(this.id)

        interaction.reloadSelectionRects()
    }
}

export default StudioCanvas