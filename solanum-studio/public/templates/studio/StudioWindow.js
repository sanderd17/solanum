import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvas from '/templates/studio/canvas/StudioCanvas.js'
import ProjectBrowser from '/templates/studio/projectBrowser/ProjectBrowser.js'
import TagBrowser from '/templates/studio/tagBrowser/TagBrowser.js'
import PropEditor from '/templates/studio/propEditor/PropEditor.js'
import LayoutBar from "/templates/studio/menuBars/LayoutBar.js"

class StudioWindow extends Template {
    static childDefinitions = {
        layoutBar: {
            type: LayoutBar,
            position: {left: '0px', top:'0px', width: '100%', height: '20px'},
            props: {
                positionUnit: 'px'
            },
            eventHandlers: {}
        },
        canvas: {
            type: StudioCanvas,
            position: {left: "300px", right: "300px", top: "20px", bottom: "0px"},
            props: {},
            eventHandlers: {},
        },
        projectBrowser: {
            type: ProjectBrowser,
            position: {left: "0px", width: "300px", top: "20px", height: "50%"},
            props: {},
            eventHandlers: {},
        },
        tagBrowser: {
            type: TagBrowser,
            position: {left: "0px", width: "300px", bottom: "20px", height: "50%"},
            props: {},
            eventHandlers: {},
        },
        propEditor: {
            type: PropEditor,
            position: {right: "0px", width: "300px", top: "20px", bottom: "0px"},
            props: {},
            eventHandlers: {},
        },
    }

    positionUnit = 'px'

    /**
     * @type {Array<Template>}
     */
    _cmpSelection = []
    set cmpSelection(cmpSelection) {
        this._cmpSelection = cmpSelection
        this.children.propEditor.cmpSelection = cmpSelection
    }

    get cmpSelection() {
        return this._cmpSelection
    }

    openComponent(mod, cmp) {
        this.children.canvas.setComponent(mod, cmp)
    }

}

export default StudioWindow