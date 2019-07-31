import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    static childDefinitions = {
        icon: {
            type: Circle,
            position: {
                left: "4%",
                width: "69%",
                top: "6%",
                height: "69%"
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
                left: "63%",
                width: "28%",
                top: "64%",
                height: "25%"
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