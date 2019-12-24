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
                left: "2.000000305175758%",
                width: "82.9999982452394%",
                height: "84.99999786376969%",
                top: "8.392333352702508e-7%"
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
                left: "72.99999938964848%",
                width: "25%",
                top: "64.99999954223637%",
                height: "25%"
            },
            properties: {fill: '"blue"'},
            eventHandlers: { }
        })
    }

    static defaultSize = [100, 100]
}

export default Motor