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
                width: "92%",
                top: "11%",
                height: "82%"
            },
            props: {},
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
                left: "53%",
                width: "34%",
                top: "55%",
                height: "38%"
            },
            props: {fill: 'blue'},
            eventHandlers: { }
        }
    }

    static defaultProps = {
        'motor': 'red'
    }

    set color (color) {
        this.dynamicFields.color = color
        this.children.icon.fill = color
    }

    get color () {
        return this.dynamicFields.color
    }

    static defaultSize = [100, 100]
}

export default Motor