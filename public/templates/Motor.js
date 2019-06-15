import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    myField = 2;
    init() {
        this.setChildren({
            icon: {
                type: Circle,
                position: {
                    left: "15%",
                    width: "66%",
                    top: "37%",
                    height: "64%"
                },
                props: {fill: P.BoundTag('motor', m => `Motors/${m}`)},
                eventHandlers: {
                    click: (ev) => {
                        let path = 'Motors/' + this.props.motor
                        ts.writeTag(path, 'black')}
                }
            },
            icon2: {
                type: Circle,
                position: {left: "62%", width: "27%", top: "18%", height: "51%"},
                props: {fill: P.Raw('blue')},
                eventHandlers: { }
            },
        })
    }
}

Motor.prototype.defaultSize = [100, 100]

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