import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'

class Motor extends Template {
    static childStyles = {
        icon: [
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
    }

    children = {
        icon: new Circle({
            parent: this,
            position: {
                left: "10%",
                width: "80%",
                height: "80%",
                top: "10%"
            },
            props: {fill: "red", prop2: 'test'},
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
        }),

        icon2: new Circle({
            parent: this,
            position: {
                left: "70%",
                width: "25%",
                top: "71%",
                height: "25%"
            },
            props: {fill: "blue"},
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