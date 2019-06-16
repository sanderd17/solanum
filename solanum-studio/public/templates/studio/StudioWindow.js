import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvas from '/templates/studio/canvas/StudioCanvas.js'
import ProjectBrowser from '/templates/studio/projectBrowser/ProjectBrowser.js'
import TagBrowser from '/templates/studio/tagBrowser/TagBrowser.js'
import PropEditor from '/templates/studio/propEditor/PropEditor.js'

class StudioWindow extends Template {
    static childDefinitions = {
        canvas: {
            type: StudioCanvas,
            position: {left: "300px", right: "300px", top: "0px", bottom: "0px"},
            props: {},
            eventHandlers: {},
        },
        projectBrowser: {
            type: ProjectBrowser,
            position: {left: "0px", width: "300px", top: "0px", height: "50%"},
            props: {},
            eventHandlers: {},
        },
        tagBrowser: {
            type: TagBrowser,
            position: {left: "0px", width: "300px", bottom: "0px", height: "50%"},
            props: {},
            eventHandlers: {},
        },
        propEditor: {
            type: PropEditor,
            position: {right: "0px", width: "300px", top: "0px", bottom: "0px"},
            props: {},
            eventHandlers: {},
        },
    }

    openComponent(mod, cmp) {
        this.children.canvas.setComponent(mod, cmp)
    }

}

StudioWindow.prototype.css = {
    'canvas': {
        'background-color': '#909090'
    },
    'projectBrowser': { // TODO component should be able to set own CSS
        'overflow': 'scroll'
    }
}

export default StudioWindow