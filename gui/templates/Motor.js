import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class Motor extends Template {}

Motor.prototype.class = 'motor'
Motor.prototype.css = [
    `.icon_1:hover {
        cursor: pointer;
    }`,
]

Motor.prototype.eventHandlers = {
    'icon_1': {
        /** @type {eventHandler} */
        'click':  (cmp, event) => {ts.writeTag(cmp.props.st_motor, 'black')}
    },
    'icon_2': {
        /** @type {eventHandler} */
        'click':  (cmp, event) => {cmp.props.size = 20}
    }
}

Motor.prototype.tagBindings = [
    [
        (cmp) => cmp.props.st_motor,
        /**
         * @param {Template} cmp
         * @param {string} path 
         * @param {import ('../lib/TagSet.js').Tag} tag
         */
        (cmp, path, tag) => {cmp.dom.icon_1.fill = tag.value}
    ]
]

Motor.prototype.dataBindings = {
    /**
     * @param {Template} cmp
     * @param {object} value
     */
    'icon_size': (cmp, value) => {cmp.dom.icon_2.width = value}
}

Motor.prototype.render = function() {
    // TODO get rid of namespace, only needed for editor
    return `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
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
