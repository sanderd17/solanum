import Template from "/lib/template.js"
import Prop from '/lib/ComponentProp.js'
import StudioCanvasInteraction from '/templates/studio/canvas/StudioCanvasInteraction.js'

class StudioCanvas extends Template {
    static styles = {
        'background-color': '#909090',
        '>.preview': {
            'background-color': '#FFFFFF'
        },
    }

    constructor(...args) {
        super(...args)
        this.init()
    }

    properties = {
        cmpSelection: new Prop('{}')
    }

    /**
     * @param {new({}) => *} cls Class to construct the preview
     */
    setComponent(cls) {
        // load the module from the Studio API
        // cnt ensures a reload by using a different URL
        this.removeChild('preview')
        this.removeChild('interaction')
        try {
            let [width, height] = cls.defaultSize
            this.addChild('preview', new cls({
                parent: this,
                position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            }))

            this.addChild('interaction', new StudioCanvasInteraction({
                parent: this,
                position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
                properties: {elWidth: `'${width}'`, elHeight: `'${height}'`, selection: "Object.keys(Prop('cmpSelection'))"},
                eventHandlers: {
                    childpositionchanged: (ev) => this.setChildPosition(ev.detail.childId, ev.detail.newPosition, ev.detail.previewOnly),
                    droppedchild: (ev) => this.addNewChild(ev.detail.childId, {
                        type: ev.detail.type,
                        position: ev.detail.position,
                    }),
                    deletedchildren: (ev) => this.removeChildren(ev.detail.childIds)
                },
            }))

            this.children.preview.disableEventHandlers()
            this.children.interaction.reloadSelectionRects(this.children.preview.children)
        } catch (e) {
            console.error(`Error while loading component ${cls.name}:`)
            console.error(e)
        }
        return this.children.preview
    }

    setOwnPropBinding(propName, newBinding) {
        let prop = this.children.preview.properties[propName]
        prop.setBinding(newBinding)
        prop.recalcValue()
    }

    addNewChild(id, childDefinition) {
        this.children.preview.addChild(id, childDefinition)

        this.children.interaction.reloadSelectionRects()
    }

    setChildPosition(id, newPosition, previewOnly=false) {
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