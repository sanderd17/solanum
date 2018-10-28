// import whatever gui template/screens needed
import Template from "./lib/template.js"
import Motor from "./templates/motor.js"

function MainWindow () {}

MainWindow.prototype = Object.create(Template.prototype)
MainWindow.prototype.constructor = MainWindow

MainWindow.prototype.size = [300, 500]

MainWindow.prototype.getReplacements = function() {
    let repl = {}
    for (let i = 0; i < 3000; i++) {
        repl["motor_" + i] = Motor
    }
    return repl
}

MainWindow.prototype.getHandlers = function() {
    return {
        "button_1": {
            "onclick": () => alert("clicked")
        }
    }
}


MainWindow.getSvg = function(parentId) {
    let svg = []
    for (let i = 0; i < 3000; i++) {
        let id = `${parentId}.motor_${i}`
        svg.push(`<svg id="${id}" width="10" height="10" x="${12 * Math.floor(i/40)}" y="${(i%40) * 12}" viewBox="0 0 500 500" sd:st_motor="Motors/M${i}" sd:size="40">${Motor.getSvg(id)}</svg>`)
    }
    svg = svg.join("\n") + `
        <rect id="${parentId}.button_1" x="0" y="480" width="150" height="50" class="translation">
<!--            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                from="0 480"
                to="100 480"
                begin="0s"
                dur="5s"
                repeatCount="indefinite"/>
-->
        </rect>`
    return svg
}
export default MainWindow
