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
    return this.svg`<svg class="motor" viewBox="0 0 500 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g class="layer">
            <title>Motor {st_motor}</title>
            <circle id="{id}.icon_1" class="icon_1" cx="267.49999713897705" cy="284" r="200" fill="blue"/>
            <rect id="{id}.icon_2" height="100" width="100" x="46" y="21" fill="red"/>
            <rect id="{id}.icon_3" height="100" width="100" x="0" y="400" fill="red"/>
        </g>
    </svg>`;
}
    /*
    return this.svg`<svg class="" viewBox="0 0 500 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>Motor {st_motor}</title>
        <circle id="{id}.icon_1" class="icon_1" cx="267.49999713897705" cy="284" r="200" fill="blue"/>
        <rect id="{id}.icon_2" height="100" width="100" x="46" y="21" fill="red"/>
        <rect id="{id}.icon_3" height="100" width="100" x="0" y="400" fill="red"/>
    </svg>`
    */

export default Motor
