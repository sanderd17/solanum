import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

class Motor extends Template {}

Motor.prototype.class = 'motor'
Motor.prototype.css = [
    `.icon_1:hover {
        stroke: blue;
        stroke-width: 50px;
        cursor: pointer;
    }`,
]

Motor.prototype.eventHandlers = {
    'icon_1': {
        /** @param {event} event */
        'click':  function(event) {ts.writeTag(this.data.st_motor, 'black')}
    },
    'icon_2': {
        /** @param {event} event */
        'click':  function(event) {this.data.size = 20}
    }
}

Motor.prototype.tagBindings = [
    [
        function() {return this.data.st_motor},
        /**
         * @param {string} path 
         */
        function(path, tag) {this.dom.icon_1.fill = tag.value}
    ]
]

Motor.prototype.dataBindings = {
    /**
     * @param {Object} v
     */
    'size': function(v) {this.dom.icon_2.width = v}
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
    </svg>`;
    }

export default Motor
