import Template from '/lib/template.js'
import P from '/lib/Prop.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    static childDefinitions = {
        icon: {
            type: Circle,
            position: {
                left: "8%",
                width: "86%",
                top: "10%",
                height: "60%"
            },
            props: {fill: 'red'},
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

    set motor(motor) {
        this._motor = motor

        ts.setSubscription(this.children.icon, 'fill', `Motors/${motor}`)
    }

    get motor() {
        return this._motor
    }

    static defaultSize = [100, 100]
}

export default Motor