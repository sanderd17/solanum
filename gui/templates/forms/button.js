/*
import Template from "../../lib/template.js"

function Button () {}

Button.prototype = Object.create(Template.prototype)
Button.prototype.constructor = Button


Button.prototype.getHandlers = function() {
    return {
        "icon_1" : {
            "onclick": () => {
                let button = this.getElementById('icon_2')
                if (button.getAttribute("fill") == "red") {
                    button.setAttribute("fill", "blue")
                } else {
                    button.setAttribute("fill", "red")
                }
            }
        }
    }
}

Button.prototype.getTagBindings = function() {
    return {}
}

Button.prototype.getDataBindings = function() {
    return {
        size : v => this.getElementById('icon_2').setAttribute('width', v)
    }
}

Button.getSvg = function(id, width, height, x, y, data) {
    return `
    <svg
            id="${id}"
            class="button"
            width="${width}"
            height="${height}"
            x="${x}"
            y="${y}"
            viewBox="0 0 500 500"
        >
        <rect id="${id}.rect" height="100" width="100" x="400" y="400" fill="red"></rect>
    </svg>`
}

Button.getCss = function() {
    return `
        .button > .rect:hover {
            filter: brightness(85%);
        }`
}

export default Button
*/