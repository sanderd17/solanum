
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
        componentInfo: new Prop('null', () => {
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
            this.removeChild(c)
        }

        let info = this.properties.componentInfo.value
        if (info == null)
            return
        let ast = info.ast

        this.propertiesAst = getOwnPropertiesAst(ast)

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
                position: { left: '1px', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: "''" },
                eventHandlers: { change: (ev, root, child) => this.setKeyName(name, child) },
            })
            this.children['key_' + i].properties.value.value = name
            this.children['binding_' + i] =  new Textbox({
                parent: this,
                position: { right: '1px', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: "''" },
                eventHandlers: { change: (ev, root, child) => this.setPropValue(name, child) },
            })
            this.children['binding_' + i].properties.value.value = binding
        }
    }

    /**
     * @param {string} propertyName
     * @param {Textbox} textBox 
     */
    setKeyName(propertyName, textBox) {
        console.warn(textBox)
    }

    /**
     * @param {string} propertyName
     * @param {Textbox} textBox 
     */
    setPropValue(propertyName, textBox) {
        let newBinding = textBox.properties.value.value

        console.log(propertyName, newBinding)
        this.__dom.dispatchEvent(new CustomEvent('ownPropChanged', {
            bubbles: true,
            detail: {propertyName, newBinding}
        }))
    }
}

export default OwnPropEditor