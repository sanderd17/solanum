import Template, {BoundProp, RawProp,TagProp, BoundTagProp} from '../lib/template.js'
import ts from '../lib/TagSet.js'
import Circle from './draw/Circle.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class Motor extends Template {
    constructor(p) {
        super(p)

        this.setChildren({
            circle: new Circle({
                position: {left: '10%', width: '80%', top: '10%', height: '80%'},
                props: {fill: new BoundTagProp('motor', m => `Motors/${m}`)},
                eventHandlers: {click: (ev) => {ts.writeTag('Motors/M1', 'black')}}
            })
        })
    }
}

Motor.prototype.css = [
    `.motor > .icon_1:hover {
        cursor: pointer;
    }`,
]

/*
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
