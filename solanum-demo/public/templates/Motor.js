import Template from '/lib/template.js'
import Circle from '/templates/draw/Circle.js'
import solanum from '/lib/solanum.js'
import Prop from '/lib/ComponentProp.js'

class Motor extends Template {
    constructor(args) {
        super(args)
        this.init()
    }

    properties = {
        ...this.properties,
        motor: new Prop("'M1'"),
    }

    static styles = {
        '>.icon': {
            stroke: 'black',
            strokeWidth: '2px',
            ':hover': {
                'cursor': 'pointer'
            }
        },
    }

    children = {
        icon: new Circle({
            parent: this,
            position: {
                left: "1%",
                width: "79%",
                height: "78%",
                top: "11%"
            },
            properties: {fill: "Tag(`Motors/${Prop(\"motor\")}.sColor`, \"blue\")", prop2: '`Motors/${Prop("motor")}.sId`'},
            eventHandlers: {
                /**@param {Event} ev */ 
                click: (ev) => {
                    let path = `"Motors/${this.prop.motor}"`
                    solanum.openPopup('popMotorInfo', {path})
                }
            },
        }),

        icon2: new Circle({
            parent: this,
            position: {
                left: "70%",
                width: "25%",
                top: "70%",
                height: "25%"
            },
            properties: {fill: "\"blue\" "},
            eventHandlers: { }
        })
    }

    static defaultSize = [100, 100]
}

export default Motor