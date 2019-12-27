
import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import Textbox from '/templates/forms/Textbox.js'
import {getOwnPropertiesAst} from '/lib/AstNavigator.js'
 
/** @typedef { import('recast').types.namedTypes.Property} Property */

const ROWHEIGHT = 20
const VMARGIN = 5

class OwnPropEditor extends Template {

    constructor(...args) {
        super(...args)
        this.init()
    }

    properties = {
        componentAst: new Prop('null', () => {
            this.loadModuleProperties()
        }),
    }

    static defaultSize = [300, 150]

    children  = {
    }

    loadModuleProperties() {
        let ast = this.properties.componentAst.value
        if (ast == null)
            return

        /** @type {Property[]} */
        let propertiesAst = getOwnPropertiesAst(this.properties.componentAst.value)

        if (!propertiesAst) {
            // TODO configure empty properties object
            throw new Error('Could not find properties for given AST')
        }

        for (let [i, el] of Object.entries(propertiesAst)) {
            let name = ""
            if (el.key.type == "Identifier") {
                name = '"' + el.key.name + '"'
            } else if (el.key.type == "Literal") {
                name = el.key.raw
            }

            let value = ""
            if (el.value.type != "NewExpression") {
                console.error(`Property with name ${name} isn't constructed with a Prop constructor`)
            } else if (el.value.arguments.length < 1) {
                console.error(`Property with name ${name} has no arguments in constructor`)
            } else if (el.value.arguments[0].type != 'Literal') {
                console.error(`Property with name ${name} has no literal string as first argument`)
            } else {
                value = el.value.arguments[0].raw
            }

            this.children['key_' + i] =  new Textbox({
                parent: this,
                position: { left: '1%', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: name },
                eventHandlers: { change: (ev, root, child) => this.setKeyName(child) },
            })
            this.children['value_' + i] =  new Textbox({
                parent: this,
                position: { right: '1%', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: value },
                eventHandlers: { change: (ev, root, child) => this.setKeyName(child) },
            })


            console.log(name, value)
        }
    }

    setKeyName(textBoxId) {
        console.log(textBoxId)
    }
}

export default OwnPropEditor