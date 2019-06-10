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
                position: {left: "100px", right: "100px", top: "0px", bottom: "0px"},
                props: {},
                eventHandlers: {},
            }),
            projectBrowser: new ProjectBrowser({
                position: {left: "0px", width: "100px", top: "0px", height: "50%"},
                props: {},
                eventHandlers: {},
            }),
            tagBrowser: new TagBrowser({
                position: {left: "0px", width: "100px", bottom: "0px", height: "50%"},
                props: {},
                eventHandlers: {},
            }),
            propEditor: new PropEditor({
                position: {right: "0px", width: "100px", top: "0px", bottom: "0px"},
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
    }
}

export default StudioWindow