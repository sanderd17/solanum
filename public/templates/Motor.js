import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    static childDefinitions = {
        icon: {
            type: Circle,
            position: {
                left: "5%",
                width: "46%",
                top: "11%",
                height: "64%"
            },
            props: {fill: P.BoundTag('motor', m => `Motors/${m}`)},
            eventHandlers: {
                click: (ev, root) => {
                    let path = 'Motors/' + root.props.motor
                    ts.writeTag(path, 'black')}
            },
            styles: [
                {
                    declarations: {
                        'stroke': 'black',
                        'stroke-width': '2px',
                    }
                },
                {
                    states: ['hover'],
                    declarations: {
                        'cursor': 'pointer',
                    }
                }
            ]
        },

        icon2: {
            type: Circle,
            position: {
                left: "73%",
                width: "21%",
                top: "9%",
                height: "38%"
            },
            props: {fill: P.Raw('blue')},
            eventHandlers: { }
        },
    }

    static defaultProps = {
        'motor': 'M0'
    }

    static defaultSize = [100, 100]
}

export default Motor