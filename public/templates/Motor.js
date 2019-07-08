import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    static childDefinitions = {
        icon: {
            type: Circle,
            position: {
                left: "2%",
                width: "97%",
                top: "8%",
                height: "82%"
            },
            props: {},
            eventHandlers: {
                click: (ev, root) => {
                    let path = 'Motors/' + root.motor
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
                left: "67%",
                width: "34%",
                top: "63%",
                height: "38%"
            },
            props: {fill: 'blue'},
            eventHandlers: { }
        }
    }

    static defaultProps = {
        'color': 'red'
    }

    set color(color) {
        this.dynamicFields.color = color
        this.children.icon.fill = color
    }

    get color() {
        return this.dynamicFields.color
    }

    set motor(motor) {
        this.dynamicFields.motor = motor

        ts.setSubscription(this, 'color', `Motors/${motor}`)
    }

    get motor() {
        return this.dynamicFields.motor
    }

    static defaultSize = [100, 100]
}

export default Motor