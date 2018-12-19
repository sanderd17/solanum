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


Button.prototype.render = function() {
    return this.svg`
        <svg class="btn" viewBox="0 0 100 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect id="btn" width="100%" height="100%" rx="5" ry="5" fill="#E9E9E9" stroke="black"/>
        <image id="img" height="100%" width="100%"/>
        </svg>
        `
}

export default Button