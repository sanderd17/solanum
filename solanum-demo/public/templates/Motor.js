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
        motor: new Prop('M1'),
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
                left: "4%",
                width: "77%",
                height: "78%",
                top: "13%"
            },
            properties: {
                fill: ({Tag}) => Tag(`default.Motors.${this.prop.motor}.sColor`, "blue"),
                prop2: () => `default.Motors.${this.prop.motor}.sId`,
            },
            eventHandlers: {
                /**@param {Event} ev */ 
                click: (ev) => {
                    let path = `default.Motors.${this.prop.motor}`
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
            properties: {fill: "blue"},
            eventHandlers: { }
        })
    }

    static defaultSize = [100, 100]
}

export default Motor