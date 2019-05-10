import Template from '../lib/template.js'
import P from '../lib/Prop.js'
import ts from '../lib/TagSet.js'
import Circle from './draw/Circle.js'

class Motor extends Template {

    constructor(p) {
        super(p)

        this.setChildren({
            circle: new Circle({
                position: {left: '10%', width: '80%', top: '10%', height: '80%'},
                props: {fill: P.BoundTag('motor', m => `Motors/${m}`)},
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

export default Motor