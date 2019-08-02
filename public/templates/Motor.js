import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
     children = {
        icon: new Circle({
            parent: this,
            position: {
                left: "18%",
                width: "72%",
                top: "19%",
                height: "69%"
            },
            props: {fill: 'red'},
            eventHandlers: {
                /**
                 * @param {Event} ev
                 * @param {Motor} root
                 */ 
                click: (ev, root) => {
                    let path = 'Motors/' + root.motor
                    ts.writeTag(path, 'black')
                }
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
        }),

        icon2: new Circle({
            parent: this,
            position: {
                left: "65%",
                width: "28%",
                top: "68%",
                height: "25%"
            },
            props: {fill: 'blue'},
            eventHandlers: { }
        })
    }

    _motor = ''
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