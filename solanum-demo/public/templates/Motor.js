import Template from '/lib/template.js'
import Circle from '/templates/draw/Circle.js'
import solanum from '/lib/solanum.js'
import Prop from '/lib/ComponentProp.js'

class Motor extends Template {
    constructor(...args) {
        super(...args)
        this.init()
    }

    properties = {
        motor: new Prop("'M1'"),
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
                left: "7.000001754760607%",
                width: "82.9999982452394%",
                height: "84.99999786376969%",
                top: "4.000002136230307%"
            },
            properties: {fill: 'Tag(`Motors/${Prop("motor")}`, "red")', prop2: '`Motors/${Prop("motor")}`'},
            eventHandlers: {
                /**
                 * @param {Event} ev
                 * @param {Motor} root
                 */ 
                click: (ev, root) => {
                    let path = `"Motors/${root.p.motor.value}"`
                    solanum.openPopup('popMotorInfo', {path})
                }
            },
        }),

        icon2: new Circle({
            parent: this,
            position: {
                left: "65.99999992370606%",
                width: "25%",
                top: "59.00000045776363%",
                height: "25%"
            },
            properties: {fill: '"blue"'},
            eventHandlers: { }
        })
    }

    static defaultSize = [100, 100]
}

export default Motor