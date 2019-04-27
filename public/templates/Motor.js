import Template from '../lib/template.js'
import ts from '../lib/TagSet.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class Motor extends Template {
    constructor(...args) {
        super(...args)
    }

    get dom() {
        if (this.domNode != null)
            return this.domNode
        this.domNode = document.createElementNS("http://www.w3.org/2000/svg", "svg")

        this.domNode.setAttribute('viewBox', '0 0 500 500')
        //this.domNode.setAttribute('xmlns', "http://www.w3.org/2000/svg")
        //this.domNode.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink")
        this.domNode.setAttribute('version', '1.1')
        this.domNode.innerHTML = `
                <circle id="icon_1" class="icon_1" cx="236.33116626739502" cy="221.66233825683594" r="200" fill="blue"></circle>
                <rect id="icon_2" height="100" width="100" x="375" y="8" fill="#ff0000"></rect>
                <rect id="icon_3" height="100" width="100" x="12" y="130" fill="red"></rect>`
        return this.domNode
    }
}

Motor.prototype.css = [
    `.motor > .icon_1:hover {
        cursor: pointer;
    }`,
]

/**
 * @typedef {function(Motor, MouseEvent): null} Handler
 */
/*
Motor.prototype.eventHandlers = {
    icon_1: {
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
*/
export default Motor
