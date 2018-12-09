import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class Motor extends Template {}

Motor.prototype.class = 'motor'
Motor.prototype.size = [500,500]
Motor.prototype.css = [
    `.motor > .icon_1:hover {
        cursor: pointer;
    }`,
]

Motor.prototype.eventHandlers = {
    icon_1: {
        click:  (cmp, event) => {ts.writeTag(cmp.props.st_motor, 'black')}
    },
    icon_2: {
        click:  (cmp, event) => {cmp.props.size = 20}
    }
}

Motor.prototype.domBindings = {
    icon_1: {
        fill: {
            type: 'tag',
            tagPath: '{st_motor}',
        }
    },
    icon_2: {
        width: {
            type: 'prop',
            propName: 'icon_size'
        } 
    },
}

Motor.prototype.render = function() {
    return this.svg`
        <title style="pointer-events:inherit">Motor {st_motor}</title>
        <circle id="{id}.icon_1" class="icon_1" cx="250" cy="250" r="200" fill="blue"/>
        <rect id="{id}.icon_2" height="100" width="100" x="400" y="400" fill="red"/>`
}

export default Motor
