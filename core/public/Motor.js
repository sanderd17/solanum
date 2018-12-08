
import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

//

class Motor extends Template {}

Motor.prototype.class = 'motor'
Motor.prototype.size = [500,500]
Motor.prototype.css = []

Motor.prototype.eventHandlers = {
    'icon_1': {
        'click':  (cmp, event) => {ts.writeTag(cmp.props.st_motor, 'black')}
    },
    'icon_2': {
        'click':  (cmp, event) => {cmp.props.size = 20}
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
    return this.svg`<title style="pointer-events:inherit">Motor {st_motor}</title><circle id="id.icon_1" class="icon_1" cx="250" cy="250" r="200" fill="blue" style="pointer-events:inherit"></circle><rect id="id.icon_2" height="100" width="100" x="406" y="-1" fill="red" transform="translate(506 -1) scale(5.02 3.09) translate(-506 1)"></rect>`
}

export default Motor
