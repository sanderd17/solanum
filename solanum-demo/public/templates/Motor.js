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
        motor: new Prop("'M0'"),
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
                left: "3%",
                width: "88%",
                height: "90%",
                top: "4%"
            },
            properties: {fill: 'Tag(`Motors/${Prop("motor")}`, "red")', prop2: '`Motors/${Prop("motor")}`'},
            eventHandlers: {
                /**@param {Event} ev */ 
                click: (ev) => {
                    let path = `"Motors/${this.properties.motor.value}"`
                    solanum.openPopup('popMotorInfo', {path})
                }
            },
        }),

        icon2: new Circle({
            parent: this,
            position: {
                left: "73.99999984741213%",
                width: "25%",
                top: "72.99999931335455%",
                height: "25%"
            },
            properties: {fill: "\"blue\" "},
            eventHandlers: { }
        })
    }

    static defaultSize = [100, 100]
}

export default Motor