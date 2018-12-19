import Template from "../../lib/template.js"

class Button extends Template {}

Button.prototype.class = 'button'
Button.prototype.size = [50,50]
Button.prototype.css = [
    `.button:hover {
        cursor: pointer;
    }`,
]

Button.prototype.eventHandlers = {}
Button.prototype.domBindings = {}


Button.prototype.render = function(id, width, height, x, y, data) {
    return this.svg`
        <g>
        <rect id="{id}.btn" width="100%" height="100%" rx="5" ry="5" fill="#E9E9E9" stroke="black"/>
        <image id="{id}.img" href="{img}" height="100%" width="100%"/>
        </g>
        `
}

export default Button