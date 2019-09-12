import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'
import solanum from '/lib/solanum.js'

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
                left: "5%",
                width: "90%",
                height: "90%",
                top: "5%"
            },
            props: {fill: "red", prop2: 'test'},
            eventHandlers: {
                /**
                 * @param {Event} ev
                 * @param {Motor} root
                 */ 
                click: (ev, root) => {
                    let path = 'Motors/' + root.motor
                    solanum.openPopup('popMotorInfo', {path})
                }
            },
        }),

        icon2: new Circle({
            parent: this,
            position: {
                left: "74.99999725341817%",
                width: "25%",
                top: "75.99999732971212%",
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