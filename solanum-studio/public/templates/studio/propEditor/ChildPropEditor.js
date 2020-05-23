import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import Textbox from '/templates/forms/Textbox.js'
import {getChildProps, getPropertyKeyName} from '/lib/AstNavigator.js'

const ROWHEIGHT = 20
const VMARGIN = 5

class ChildPropEditor extends Template {

    properties = {
        cmpSelection: new Prop({}, (v) => {
            this.resetSelectionProps()
        }),
        componentInfo: new Prop(null),
    }

    constructor(args) {
        super(args)
        this.init()
    }

    static defaultSize = [300, 150]
    
    propNames = []
    resetSelectionProps() {
        for (let childId in this.children) {
            this.removeChild(childId)
        }

        // get the configured properties for the selected children
        if (!this.prop.componentInfo)
            return // No component loaded

        let ast = this.prop.componentInfo.ast

        let childPropList = []
        let cmpSelection = this.prop.cmpSelection
        for (let childId of Object.keys(cmpSelection)) {
            let propBinding = {}
            let propsAst = getChildProps(ast, childId)
            for (let p of propsAst.properties) {
                let keyName = getPropertyKeyName(p)
                if (p.value.type != 'Literal' || typeof p.value.value != 'string')
                    throw new Error(`Property ${keyName} doesn't have a literal string als value`)
                propBinding[keyName] = p.value.value
            }
            childPropList.push(propBinding)
        }

        let commonProps = {...childPropList[0]}

        for (let propBinding of childPropList) {
            for (let [key, val] of Object.entries(commonProps)) {
                if (!(key in propBinding)) {
                    delete commonProps[key]
                    continue
                }
                if (val != propBinding[key]) {
                    commonProps[key] = undefined
                }
            }
        }

        this.propNames = Object.keys(commonProps).sort()
        for (let [i, name] of Object.entries(this.propNames)) {
            let binding = commonProps[name]
            this.addChild('key_' + name, new Textbox({
                parent: this,
                position: { left: '1px', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: "''", datalist: "['test1','test2']" }, // TODO get all possible property names into the datalist
                eventHandlers: { change: (ev, textBox) => this.setKeyName(name, textBox) },
            }))
            this.children['key_' + name].prop.value = name
            this.addChild('binding_' + name, new Textbox({
                parent: this,
                position: { right: '1px', top: (+i * (ROWHEIGHT + VMARGIN))  + 'px', height: ROWHEIGHT + 'px', width: '48%' },
                properties: { value: "''" },
                style: { background: "'#FFFFFF'" },
                eventHandlers: {
                    change: (ev, textBox) => this.propValueChanged(name, textBox),
                    input: (ev, textBox) => this.checkValidFunction(name, textBox),
                },
            }))
            this.children['binding_' + name].prop.value = binding
        }
    }

    /**
     * @param {string} propertyName 
     * @param {Textbox} textBox 
     */
    checkValidFunction(propertyName, textBox) {
        let value = textBox.prop.value
        try {
            let f = new Function(value)
        } catch (e) {
            console.error(e) // TODO format and display in tooltip
            textBox.style.background = '#FF8080'
            return false
        }
        textBox.style.background = '#FFFFFF'
        return true
    }

    /**
     * @param {string} propertyName 
     * @param {Textbox} textBox 
     */
    propValueChanged(propertyName, textBox) {
        if (!this.checkValidFunction(propertyName, textBox))
            return

        let value = textBox.prop.value
        this.dispatchEvent('childPropChanged', {childIds: Object.keys(this.prop.cmpSelection), propertyName, value})
    }

    /**
     * @param {[string]} childIds
     * @param {string} propertyName 
     * @param {string} newBinding 
     */
    setPropbinding(childIds, propertyName, newBinding) {
        for (let childId of childIds) {
            if (!(childId in this.prop.cmpSelection)) {
                // not related to the current selection
                return
            }

            if (Object.keys(this.prop.cmpSelection).length > 1) {
                // TODO support update to one of multiple children
                return
            }

            this.children['binding_' + propertyName].prop.value = newBinding
        }
    }
}

export default ChildPropEditor