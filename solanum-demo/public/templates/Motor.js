import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Circle from '/templates/draw/Circle.js'
import solanum from '/lib/solanum.js'

class Motor extends Template {
    props = {
        motor: 'M1'
    }

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
                left: "12%",
                width: "79%",
                height: "84%",
                top: "6%"
            },
            props: {fill: '"red"', prop2: '`Motors/${motor}`'},
            eventHandlers: {
                /**
                 * @param {Event} ev
                 * @param {Motor} root
                 */ 
                click: (ev, root) => {
                    let path = `"Motors/${root.motor}"`
                    solanum.openPopup('popMotorInfo', {path})
                }
            },
        }),

        icon2: new Circle({
            parent: this,
            position: {
                left: "71%",
                width: "25%",
                top: "67%",
                height: "25%"
            },
            props: {fill: '"blue"'},
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