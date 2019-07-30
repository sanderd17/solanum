import Template from "/lib/template.js"
import P from '/lib/Prop.js'
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
        let preview= {
            type: cls,
            position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            props: {},
            eventHandlers: {}
        }


        let interaction= {
            type: StudioCanvasInteraction,
            position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            props: {elWidth: P.Raw(width), elHeight: P.Raw(height)},
            eventHandlers: {}
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

    /**
     * @param { string[] } childIds
     */
    removeChildren(childIds) {
        for (let id of childIds) {
            this.children.preview.removeChild(id)
        }
    }

    /**
     * @type {Array<string>}
     */
    _selection = []
    set selection(selection) {
        this._selection = selection
        let cmpSelection = selection.map(id => this.children.preview.children[id])
        this.parent.cmpSelection = cmpSelection
    }

    get selection() {
        return this._selection
    }
}

StudioCanvas.prototype.css = {
    'preview': {
        'background-color': '#FFFFFF'
    }
}

export default StudioCanvas