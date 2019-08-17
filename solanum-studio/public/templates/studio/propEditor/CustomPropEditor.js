  
import Template from "/lib/template.js"
import Checkbox from '/templates/forms/Checkbox.js'
import Textbox from '/templates/forms/Textbox.js'

class CustomPropEditor extends Template {

    static defaultSize = [300, 150]
    children  = {
    }
    
    resetSelectionProps() {
        for (let childId in this.children) {
            if (childId.startsWith('propName_') || childId.startsWith('propValue_'))
                this.removeChild(childId)
        }

        // gather a list of all props in the selection
        this.selectedProps = {}
        for (let [childId, child] of Object.entries(this.cmpSelection)) {
            let childProps = child.cArgs.props
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
                props: {value: propName}
            }))
            this.addChild('propValue_' + i, new Textbox({
                parent: this,
                position: {left: '120px', right: '0px', top: (i*25) + 'px', height: '20px'},
                props: {value: propState.values.join(',')} // TODO should be greyed out if not all children have this value
            }))
            i++
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

export default CustomPropEditor