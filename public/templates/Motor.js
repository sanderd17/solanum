import Template, {BoundProp, RawProp,TagProp, BoundTagProp} from '../lib/template.js'
import ts from '../lib/TagSet.js'
import Circle from './draw/Circle.js'

export default class Motor extends Template {

    constructor(p) {
        super(p)

        this.setChildren({
            circle: new Circle({
                position: {left: '10%', width: '80%', top: '10%', height: '80%'},
                props: {fill: new BoundTagProp('motor', m => `Motors/${m}`)},
                eventHandlers: {click: (ev) => {
                    let path = 'Motors/' + this.props.motor
                    ts.writeTag(path, 'black')}}
            })
        })
    }
}

Motor.prototype.props = {
    'motor': 'M1'
}

Motor.prototype.css = [
    `.motor > .icon_1:hover {
        cursor: pointer;
    }`,
]
