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

    constructor(args) {
        super(args)
        this.init()
    }

    properties = {
        cmpSelection: new Prop({}),
        positionUnit: new Prop('px')
    }

    children = {
        interaction: new StudioCanvasInteraction({
            parent: this,
            position: {left: '10px', width: '100px', top:'10px', height: '100px'},
            properties: {
                selection: ({Prop}) => Object.keys(Prop('cmpSelection') || {}),
                positionUnit: ({Prop}) => Prop('positionUnit'),
            },
            eventHandlers: {
                childpositionchanged: (ev) => this.setChildPosition(ev.detail.childId, ev.detail.newPosition, ev.detail.previewOnly),
            },
            style: {
                zIndex: '10' // make sure it's in front of the preview
            }
        })
    }

    /*
     * @param {new({}) => *} cls Class to construct the preview
     */
    /**
     * 
     * @param {typeof Template} cls 
     */
    setComponent(cls) {
        // load the module from the Studio API
        // cnt ensures a reload by using a different URL
        this.removeChild('preview')
        try {
            let [width, height] = cls.defaultSize
            this.addChild('preview', new cls({
                parent: this,
                position: {left: '10px', width: width + 'px', top:'10px', height: height + 'px'},
            }))

            this.children.preview.disableEventHandlers()

            this.children.interaction.setPosition({left: '10px', width: width + 'px', top:'10px', height: height + 'px'})
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

    /**
     * 
     * @param {[string]} childIds 
     * @param {string} propertyName 
     * @param {string} newBinding 
     */
    setChildPropBinding(childIds, propertyName, newBinding) {
        let children = this.children.preview.children
        for (let id in children) {
            if (!childIds.includes(id))
                continue
            let prop = children[id].properties[propertyName]
            prop.setBinding(newBinding)
            prop.recalcValue()
        }
    }

    async addNewChild({childId, childPath, position}) {
        const moduleNewCmp = await import(childPath)
        const clsNewCmp = moduleNewCmp.default
        let child = new clsNewCmp({
            parent: this.children.preview,
            position: position
        })
        this.children.preview.addChild(childId, child)

        this.children.interaction.reloadSelectionRects(this.children.preview.children)
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
        this.children.interaction.reloadSelectionRects(this.children.preview.children)
    }
}


export default StudioCanvas