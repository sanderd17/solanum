import Template from "../lib/template.js"

function Motor () {}

Motor.prototype = Object.create(Template.prototype)
Motor.prototype.constructor = Motor


Motor.prototype.getEventHandlers = function() {
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

Motor.prototype.getTagBindings = function() {
    // TODO should support hard-coded paths, and paths depending on other data (this.data. this.id, ...)
    return {
        st_motor : (path, tag) => this.getElementById('icon_1').setAttribute('fill', tag.value)
    }
}
Motor.prototype.getDataBindings = function() {
    return {
        size : v => this.getElementById('icon_2').setAttribute('width', v)
    }
}

Motor.prototype.getSvg = function() {
    return `
    <svg
            id="${this.id}"
            class="motor"
            width="${this.loc.width}"
            height="${this.loc.height}"
            x="${this.loc.x}"
            y="${this.loc.y}"
            viewBox="0 0 500 500"
        >
        <circle id="${this.id}.icon_1" class="icon_1" cx="250" cy="250" r="200" fill="blue"></circle>
        <rect id="${this.id}.icon_2" height="100" width="100" x="400" y="400" fill="red"></rect>
    </svg>`
}

Motor.prototype.getCss = function() {
    return `
        .motor > .icon_1:hover {
            filter: brightness(85%);
        }`
}

export default Motor
