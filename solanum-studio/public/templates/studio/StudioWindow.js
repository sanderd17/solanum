import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvas from '/templates/studio/canvas/StudioCanvas.js'
import ProjectBrowser from '/templates/studio/projectBrowser/ProjectBrowser.js'

class StudioWindow extends Template {
    init() {
        this.setChildren({
            canvas: new StudioCanvas({
                position: {left: "100px", right: "0", top: "0", bottom: "0"},
                props: {},
                eventHandlers: {},
            }),
            projectBrowser: new ProjectBrowser({
                position: {left: "0px", width: "100px", top: "0", bottom: "0"},
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