import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    static childDefinitions = {
        icon: {
            type: Circle,
            position: {
                left: "7%",
                width: "67%",
                top: "11%",
                height: "64%"
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
                left: "71%",
                width: "23%",
                top: "59%",
                height: "26%"
            },
            props: {fill: 'blue'},
            eventHandlers: { }
        }
    }

    static defaultProps = {
        'color': 'red'
    }

    set color(color) {
        this._color = color
        this.children.icon.fill = color
    }

    get color() {
        return this._color
    }

    set motor(motor) {
        this._motor = motor

        ts.setSubscription(this, 'color', `Motors/${motor}`)
    }

    get motor() {
        return this._motor
    }

    static defaultSize = [100, 100]
}

export default Motor