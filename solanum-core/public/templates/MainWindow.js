// import whatever gui template/screens needed
import Template from "../lib/template.js"
import Motor from "./Motor.js"
/**  @typedef {import('../lib/template.js').TemplateDescription} TemplateDescription */
class MainWindow extends Template {}

MainWindow.prototype.class = 'window MainWindow'
MainWindow.prototype.size = [1000,500]

MainWindow.prototype.getReplacements = function() {
    /** @type {Object<string,TemplateDescription>} */
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

MainWindow.prototype.render = function() {
    return this.svg`<svg class="window" viewBox="0 0 1000 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g class="layer">
            <title>no title</title>
            <use id="motor_1" x="0" y="0" width="10" height="10"/>
            <use id="motor_2" x="0" y="12" width="10" height="10"/>
            <use id="motor_3" x="0" y="24" width="10" height="10"/>
            <use id="motor_4" x="0" y="36" width="10" height="10"/>
        </g>
    </svg>`
}

export default MainWindow
