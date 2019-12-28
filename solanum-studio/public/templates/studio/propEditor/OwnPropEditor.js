
import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import Textbox from '/templates/forms/Textbox.js'
import {getPropertyKeyName, getOwnPropertiesAst} from '/lib/AstNavigator.js'
 
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

    /** @type {Property[]} */
    propertiesAst = null
    loadModuleProperties() {
        for (let c in this.children) {
            this.children[c].destroy()
            delete this.children[c]
        }

        let ast = this.properties.componentAst.value
        if (ast == null)
            return

        this.propertiesAst = getOwnPropertiesAst(this.properties.componentAst.value)

        if (!this.propertiesAst) {
            // TODO configure empty properties object
            throw new Error('Could not find properties for given AST')
        }

        for (let [i, el] of Object.entries(this.propertiesAst)) {
            let name = getPropertyKeyName(el)

            let binding = ""
            if (el.value.type != "NewExpression") {
                console.error(`Property with name ${name} isn't constructed with a Prop constructor`)
            } else if (el.value.arguments.length < 1) {
                console.error(`Property with name ${name} has no arguments in constructor`)
            } else if (el.value.arguments[0].type != 'Literal') {
                console.error(`Property with name ${name} has no literal string as first argument`)
            } else {
                binding = el.value.arguments[0].value
            }

            this.children['key_' + i] =  new Textbox({
                parent: this,
                position: { left: '1%', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: "''" },
                eventHandlers: { change: (ev, root, child) => this.setKeyName(child, i) },
            })
            this.children['key_' + i].properties.value.value = name
            this.children['binding_' + i] =  new Textbox({
                parent: this,
                position: { right: '1%', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: "''" },
                eventHandlers: { change: (ev, root, child) => this.setPropValue(child, i) },
            })
            this.children['binding_' + i].properties.value.value = binding
        }
    }

    setKeyName(textBox, index) {
        console.warn(textBox)
    }

    /**
     * 
     * @param {Textbox} textBox 
     */
    setPropValue(textBox, index) {
        let newBinding = textBox.properties.value.value
        let propertyName = getPropertyKeyName(this.propertiesAst[index])

        console.log(propertyName, newBinding)
        this.__dom.dispatchEvent(new CustomEvent('ownPropChanged', {
            bubbles: true,
            detail: {propertyName, newBinding}
        }))
    }
}

export default OwnPropEditor