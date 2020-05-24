
import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import Textbox from '/templates/forms/Textbox.js'
import {getPropertyKeyName, getOwnPropertiesAst, codeLocToString} from '/lib/AstNavigator.js'
 
/** @typedef { import('recast').types.namedTypes.Property} Property */

const ROWHEIGHT = 20
const VMARGIN = 5

class OwnPropEditor extends Template {

    constructor(args) {
        super(args)
        this.init()
    }

    properties = {
        componentInfo: new Prop(null, () => {
            this.loadModuleProperties() // TODO causes unwanted refreshes on any change to the component
        }),
    }

    static defaultSize = [300, 150]

    /** @type {Property[]} */
    propertiesAst = null
    loadModuleProperties() {
        for (let c in this.children) {
            this.removeChild(c)
        }

        let info = this.prop.componentInfo
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
            } else {
                binding = codeLocToString(this.prop.componentInfo.code ,el.value.arguments[0].loc)
            }

            this.addChild('key_' + name, new Textbox({
                parent: this,
                position: { left: '1px', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: '' },
                eventHandlers: { change: (ev, child) => this.setKeyName(name, child) },
            }))
            this.children['key_' + name].prop.value = name
            this.addChild('binding_' + name, new Textbox({
                parent: this,
                position: { right: '1px', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: '' },
                eventHandlers: { change: (ev, child) => this.propValueChanged(name, child) },
            }))
            this.children['binding_' + name].prop.value = binding
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
    propValueChanged(propertyName, textBox) {
        let newBinding = textBox.prop.value

        console.log(propertyName, newBinding)
        this.dispatchEvent('ownPropChanged', {propertyName, newBinding})
    }

    /**
     * Set a prop binding from outside
     * @param {string} propertyName
     * @param {string} newBinding
     */
    setPropBinding(propertyName, newBinding) {
        this.children['binding_' + propertyName].prop.value = newBinding
    }
}

export default OwnPropEditor