import Template from "../lib/template.js"

function Motor () {}

Motor.prototype = Object.create(Template.prototype)
Motor.prototype.constructor = Motor

Motor.prototype.size = [500, 500]

Motor.prototype.getHandlers = function() {
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
    return {
        st_motor : (path, tag) => this.getElementById('icon_1').setAttribute('fill', tag.value)
    }
}
Motor.prototype.getDomBindings = function() {
    return {
        size : v => this.getElementById('icon_2').setAttribute('width', v)
    }
}

Motor.getSvg = function(parentId) {
    return `
    <circle id="${parentId}.icon_1" cx="250" cy="250" r="200" fill="blue"></circle>
    <rect id="${parentId}.icon_2" height="100" width="100" x="400" y="400" fill="red"></rect>
`
}
export default Motor
