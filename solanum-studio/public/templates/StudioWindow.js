import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import StudioCanvas from '/templates/canvas/StudioCanvas.js'

class StudioWindow extends Template {
    init() {
        this.setChildren({
            canvas: new StudioCanvas({
                position: {left: "0", right: "0", top: "0", bottom: "0"},
                props: {},
                eventHandlers: {},
            })
        })

        this.children.canvas.setComponent('main', 'Motor.js')
        //this.children.canvas.setComponent('main', 'MainWindow.js')
    }

}

export default StudioWindow