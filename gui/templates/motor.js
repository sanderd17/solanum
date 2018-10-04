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
        [this.data.st_motor] : [
            {
                "element": "icon_1",
                "attribute": "fill",
                "binding": (tag) => {return tag.value},
            }
        ]
    }
}

Motor.getSvg = function(parentId) {
    return `
    <circle id="${parentId}.icon_1" cx="250" cy="250" r="200" fill="blue"></circle>
    <rect id="${parentId}.icon_2" height="100" width="100" x="400" y="400" fill="red"></rect>
`
}
export default Motor
