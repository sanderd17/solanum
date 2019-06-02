import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    init() {
        this.setChildren({
            icon: new Circle({
                position: {left: "8%", width: "80%", top: "7%", height: "80%"},
                props: {fill: P.BoundTag('motor', m => `Motors/${m}`)},
                eventHandlers: {
                    click: (ev) => {
                        let path = 'Motors/' + this.props.motor
                        ts.writeTag(path, 'black')}
                }
            })
        })
    }
}

Motor.prototype.defaultProps = {
    'motor': 'M0'
}

Motor.prototype.css = {
    'icon': {
        'stroke': 'black',
        'stroke-width': '2px'
    },
    'icon:hover': {
        'cursor': 'pointer'
    },
}

export default Motor