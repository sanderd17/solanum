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

/**
 * @typedef {function(Motor, MouseEvent): null} Handler
 */
Motor.prototype.eventHandlers = {
    icon_1: {
        /** @type {Handler} */
        click:  (cmp, ev) => {ts.writeTag(cmp.props.st_motor, 'black')}
    },
    icon_2: {
        click:  (cmp, ev) => {cmp.props.size = 20}
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
            <title>Motor st_motor</title>
            <circle id="icon_1" class="icon_1" cx="236.33116626739502" cy="221.66233825683594" r="200" fill="blue"/>
            <rect id="icon_2" height="100" width="100" x="375.29869985580444" y="8.207791328430176" fill="#ff0000"/>
            <rect id="icon_3" height="100" width="100" x="12.561057269573212" y="130.69091337919235" fill="red"/>
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

/*
class Hello extends React.Component {
  render() {
    return React.createElement('div', null, `Hello ${this.props.toWhat}`);
  }
}

ReactDOM.render(
  React.createElement(Hello, {toWhat: 'World'}, null),
  document.getElementById('root')
);
*/    
export default Motor
