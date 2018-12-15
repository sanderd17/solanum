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
    let svg = []
    for (let i = 0; i < 3000; i++) {
        let c = "motor_" + i
        svg.push(`<use id="{id}.${c}" xlink:href="#cmp-{id}.${c}" x="${10 * Math.floor(i/40)}" y="${(i%40) * 12}" width="10" height="10"/>`)
    }
    return this.svg`${svg.join('\n')}`
}

export default MainWindow
