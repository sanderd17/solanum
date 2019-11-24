import Template from '/lib/template.js'
import Circle from '/templates/draw/Circle.js'
import solanum from '/lib/solanum.js'
import Prop from '/lib/ComponentProp.js'

class Motor extends Template {
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
                left: "6%",
                width: "79%",
                height: "79%",
                top: "12%"
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
                left: "71%",
                width: "25%",
                top: "67%",
                height: "25%"
            },
            properties: {fill: '"blue"'},
            eventHandlers: { }
        })
    }

    static defaultSize = [100, 100]
}

export default Motor