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
    for (let i = 0; i < 3; i++) {
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
    for (let c in this.children) {
        svg.push(this.children[c].render())
    }
    return this.svg`${svg.join('\n')}`
    return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            id="${this.id}"
            class="main"
            style="position:absolute;left:0;top:0"
            width="${this.props.width}"
            height="${this.props.height}"
            x="${this.props.x}"
            y="${this.props.y}"
            viewbox="0 0 1000 500">
        <g class="Layer">
            <title>Mainwindow</title>` +
            svg.join("\n") + `
        </g>
    </svg>`
}

export default MainWindow
