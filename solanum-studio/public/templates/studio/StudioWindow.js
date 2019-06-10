import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvas from '/templates/studio/canvas/StudioCanvas.js'
import ProjectBrowser from '/templates/studio/projectBrowser/ProjectBrowser.js'
import TagBrowser from '/templates/studio/tagBrowser/TagBrowser.js'
import PropEditor from '/templates/studio/propEditor/PropEditor.js'

class StudioWindow extends Template {
    init() {
        this.setChildren({
            canvas: new StudioCanvas({
                position: {left: "300px", right: "300px", top: "0px", bottom: "0px"},
                props: {},
                eventHandlers: {},
            }),
            projectBrowser: new ProjectBrowser({
                position: {left: "0px", width: "300px", top: "0px", height: "50%"},
                props: {},
                eventHandlers: {},
            }),
            tagBrowser: new TagBrowser({
                position: {left: "0px", width: "300px", bottom: "0px", height: "50%"},
                props: {},
                eventHandlers: {},
            }),
            propEditor: new PropEditor({
                position: {right: "0px", width: "300px", top: "0px", bottom: "0px"},
                props: {},
                eventHandlers: {},
            }),
        })

        this.children.canvas.setComponent('main', 'Motor.js')
        //this.children.canvas.setComponent('main', 'MainWindow.js')
    }

}

StudioWindow.prototype.css = {
    'canvas': {
        'background-color': '#909090'
    },
    'projectBrowser': { // TODO should be able to set own style too
        'overflow': 'scroll'
    }
}

export default StudioWindow