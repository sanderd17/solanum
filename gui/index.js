// import whatever gui template/screens needed
import Template from "./lib/template.js"
import Motor from "./templates/motor.js"

/** 
 * @constructor
 */
function MainWindow () {}

MainWindow.prototype = Object.create(Template.prototype)
MainWindow.prototype.constructor = MainWindow

MainWindow.prototype.getReplacements = function() {
    let repl = {}
    for (let i = 0; i < 3000; i++) {
        repl["motor_" + i] = {
            type: Motor,
            data: {
                st_motor: `Motors/M${i}`,
                size: 40
            },
            loc: {
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

MainWindow.prototype.getSvg = function() {
    let svg = []
    for (let c in this.children) {
        svg.push(this.children[c].getSvg())
    }
    return svg.join("\n") + `
        <rect
            id="${this.id}.button_1"
            x="0"
            y="480"
            width="150"
            height="50"
            class="translation">
        </rect>`
}

export default MainWindow
