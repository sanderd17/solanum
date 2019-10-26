  
import Template from "/lib/template.js"
import Textbox from '/templates/forms/Textbox.js'

class ChildPropEditor extends Template {

    static defaultSize = [300, 150]
    children  = {
    }
    
    resetSelectionProps() {
        for (let childId in this.children) {
            if (childId.startsWith('propName_') || childId.startsWith('propValue_'))
                this.removeChild(childId)
        }

        this.defaultPropList = []

        // gather a list of all props in the selection
        this.selectedProps = {}
        for (let [childId, child] of Object.entries(this.cmpSelection)) {
            let childProps = child.__cArgs.props
            for (let [key, value] of Object.entries(childProps)) {
                if (key in this.selectedProps) {
                    this.selectedProps[key].children.push(childId)
                    if (!(value in this.selectedProps[key].values))
                        this.selectedProps[key].values.push(value)
                } else {
                    this.selectedProps[key] = {
                        children: [childId],
                        values: [value]
                    }
                }
            }
        }

        let i = 0
        for (let [propName, propState] of Object.entries(this.selectedProps)) {
            this.addChild('propName_' + i, new Textbox({
                parent: this,
                position: {left: '0px', top: (i*25) + 'px', height: '20px', width: '100px'},
                props: {value: '"' + propName + '"'},
            }))
            this.addChild('propValue_' + i, new Textbox({
                parent: this,
                position: {left: '120px', right: '0px', top: (i*25) + 'px', height: '20px'},
                props: {value: '"' + propState.values.join(',') + '"'}, // TODO should be greyed out if not all children hav the same
                eventHandlers: { change: (ev, root, textBox) => root.setPropValue(propName, textBox) },
            }))
            i++
        }
    }

    /**
     * @param {string} propName 
     * @param {Textbox} textBox 
     */
    setPropValue(propName, textBox) {
        console.log(`Change ${propName}`)
        let childIds = this.selectedProps[propName].children

        let newValue = textBox.value
        for (let childId of childIds) {
            this.cmpSelection[childId][propName] = newValue
            this.__dom.dispatchEvent(new CustomEvent('childPropChanged', {
                bubbles: true,
                detail: {childId, propName, newValue}
            }))
        }
    }

    /**
     * @type {Object<string, Template>}
     */
    _cmpSelection = {}
    set cmpSelection(cmpSelection) {
        this._cmpSelection = cmpSelection
        this.resetSelectionProps()
    }

    get cmpSelection() {
        return this._cmpSelection
    }
}

export default ChildPropEditor