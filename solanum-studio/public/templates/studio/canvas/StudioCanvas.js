import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvasInteraction from '/templates/studio/canvas/StudioCanvasInteraction.js'

class StudioCanvas extends Template {
    init() {
        this.setChildren({ })
        this.cnt = 1
    }

    async setComponent(mod, cmp) {
        console.log(`Set component to ${mod}:${cmp}`)
        // load the module from the Studio API
        // cnt ensures a reload by using a different URL
        let mdl = await import(`/API/Studio/openComponent?module=${mod}&component=${cmp}&v=${this.cnt}`)
        this.cnt++

        // cls is the class of the replaced template
        let cls = mdl.default

        let [width, height] = cls.prototype.defaultSize
        let preview= new cls({
            position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            props: {},
            eventHandlers: {}
        })

        preview.disableEventHandlers()

        let interaction= new StudioCanvasInteraction({
            position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            props: {elWidth: P.Raw(width), elHeight: P.Raw(height)},
            eventHandlers: {}
        })

        this.setChildren({preview, interaction})
        this.setId(this.id)

        interaction.reloadSelectionRects()
    }
}

StudioCanvas.prototype.css = {
    'preview': {
        'background-color': '#FFFFFF'
    }
}

export default StudioCanvas