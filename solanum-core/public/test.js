
import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'



class test extends Template {}

test.prototype.class = 'motor'
test.prototype.size = [500,500]
test.prototype.css = []

test.prototype.eventHandlers = {
    'icon_1': {
        'click':  (cmp, event) => {ts.writeTag(cmp.props.st_motor, 'black')}
    },
    'icon_2': {
        'click':  (cmp, event) => {cmp.props.size = 20}
    }
}

test.prototype.domBindings = {}

test.prototype.render = function() {
    return this.svg`<title style="pointer-events:inherit">Layer 1</title><circle id="{id}.icon_1" class="icon_1" cx="250" cy="250" r="200" fill="blue"></circle><rect id="{id}.icon_2" height="100" width="100" x="400" y="400" fill="red"></rect>`
}

export default test
