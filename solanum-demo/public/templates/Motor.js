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
        motor: new Prop("'M0'"),
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
        dldfjasd: new Circle({
            parent: this,

            position: {
                left: "5px",
                top: "15px",
                width: "20px",
                height: "20px"
            },

            properties: {},
            eventHandlers: {}
        }),

        icon: new Circle({
            parent: this,
            position: {
                left: "7%",
                width: "88%",
                height: "88%",
                top: "7%"
            },
            properties: {fill: "Tag(`Motors/${Prop(\"motor\")}`, \"red\")", prop2: '`Motors/${Prop("motor")}`'},
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
                left: "73.99999984741213%",
                width: "25%",
                top: "72.99999931335455%",
                height: "25%"
            },
            properties: {fill: "\"blue\" "},
            eventHandlers: { }
        }),

        oisdj: new Circle({
            parent: this,

            position: {
                left: "7px",
                top: "68px",
                width: "20px",
                height: "20px"
            },

            properties: {},
            eventHandlers: {}
        })
    }

    static defaultSize = [100, 100]
}

export default Motor