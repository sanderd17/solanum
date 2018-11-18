// import whatever gui template/screens needed
import Template from "../lib/template.js"
import Motor from "./Motor.js"

class MainWindow extends Template {}

MainWindow.prototype.getReplacements = function() {
    let repl = {}
    for (let i = 0; i < 3000; i++) {
        repl["motor_" + i] = {
            type: Motor,
            props: {
                st_motor: `Motors/M${i}`,
                icon_size: 40,
                x: 10 * Math.floor(i/40),
                y: (i%40) * 12,
                width: 10,
                height: 10,
            },
        }
    }
    return repl
}

MainWindow.prototype.eventHandlers = {
    'button_1':{
        'onclick': function() {alert("clicked")}
    }
}

MainWindow.prototype.render = function() {
    let svg = []
    for (let c in this.children) {
        svg.push(this.children[c].render())
    }
    return `<svg 
            id="${this.id}"
            class="main"
            style="position:absolute;left:0;top:0"
            width="${this.props.width}"
            height="${this.props.height}"
            x="${this.props.x}"
            y="${this.props.y}"
            viewbox="0 0 1000 500">` + 
        svg.join("\n") + `
        <rect
            id="${this.id}.button_1"
            x="0"
            y="480"
            width="150"
            height="50"
            class="icon_1">
        </rect>
    </svg>`
}

export default MainWindow
