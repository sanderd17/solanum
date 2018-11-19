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
        'click':  function(event) {ts.writeTag(this.props.st_motor, 'black')}
    },
    'icon_2': {
        /** @param {event} event */
        'click':  function(event) {this.props.size = 20}
    }
}

Motor.prototype.tagBindings = [
    [
        function() {return this.props.st_motor},
        /**
         * @param {string} path 
         * @param {Tag} tag
         */
        function(path, tag) {this.dom.icon_1.fill = tag.value}
    ]
]

Motor.prototype.dataBindings = {
    /**
     * @param {Object} v
     */
    'icon_size': function(v) {this.dom.icon_2.width = v}
}

Motor.prototype.render = function() {
    return `
    <svg
            id="${this.id}"
            class="motor"
            width="${this.props.width}"
            height="${this.props.height}"
            x="${this.props.x}"
            y="${this.props.y}"
            viewBox="0 0 500 500"
        >
        <circle id="${this.id}.icon_1" class="icon_1" cx="250" cy="250" r="200" fill="blue"></circle>
        <rect id="${this.id}.icon_2" height="100" width="100" x="400" y="400" fill="red"></rect>
    </svg>`;
}

export default Motor
