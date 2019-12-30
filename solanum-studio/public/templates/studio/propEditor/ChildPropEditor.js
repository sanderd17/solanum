import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import Textbox from '/templates/forms/Textbox.js'
import {getChildProps, getPropertyKeyName} from '/lib/AstNavigator.js'

const ROWHEIGHT = 20
const VMARGIN = 5

class ChildPropEditor extends Template {

    properties = {
        cmpSelection: new Prop('{}', () => {
            this.resetSelectionProps()
        }),
        componentInfo: new Prop('null'),
    }

    constructor(...args) {
        super(...args)
        this.init()
    }

    static defaultSize = [300, 150]
    children  = {
    }
    
    propNames = []
    resetSelectionProps() {
        for (let childId in this.children) {
            this.removeChild(childId)
        }

        // get the configured properties for the selected children
        if (!this.properties.componentInfo.value)
            return // No component loaded

        let ast = this.properties.componentInfo.value.ast

        let childPropList = []
        let cmpSelection = this.properties.cmpSelection.value
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
                eventHandlers: { change: (ev, root, child) => this.setPropBinding(name, child) },
            })
            this.children['binding_' + i].properties.value.value = binding
        }
    }

    /**
     * @param {string} propName 
     * @param {Textbox} textBox 
     */
    setPropBinding(propName, textBox) {
        let value = textBox.properties.value.value
        for (let childId in this.properties.cmpSelection.value) {
            let childInstance = this.properties.cmpSelection.value[childId]
            childInstance.properties[propName].setBinding(value)
            childInstance.properties[propName].recalcValue()
            this.dispatchEvent('childPropChanged', {childId, propName, value})
        }
    }
}

export default ChildPropEditor