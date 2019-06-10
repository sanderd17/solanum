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

        //this.children.canvas.setComponent('main', 'MainWindow.js')
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