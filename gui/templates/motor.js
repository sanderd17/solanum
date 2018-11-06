import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

function Motor () {}

Motor.prototype = Object.create(Template.prototype)
Motor.prototype.constructor = Motor

Motor.prototype.class = 'motor'
Motor.prototype.css = [
    `.icon_1:hover {
        filter: brightness(85%);
    }`,
]

Motor.prototype.eventHandlers = {
    'icon_1': {
        'onclick':  function() {ts.writeTag(this.data.st_motor, 'red')}
    }
}

Motor.prototype.tagBindings = [
    [
        function() {return this.data.st_motor},
        function(path, tag) {this.getElementById('icon_1').setAttribute('fill', tag.value)}
    ]
]

Motor.prototype.dataBindings = {
    'size': function(v) {this.getElementById('icon_2').setAttribute('width', v)}
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

export default Motor
