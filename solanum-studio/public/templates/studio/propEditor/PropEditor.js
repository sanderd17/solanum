import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import PositionPropEditor from '/templates/studio/propEditor/PositionPropEditor.js'
import ChildPropEditor from '/templates/studio/propEditor/ChildPropEditor.js'
import OwnPropEditor from '/templates/studio/propEditor/OwnPropEditor.js'
import StylePropEditor from '/templates/studio/propEditor/StylePropEditor.js'

class PropEditor extends Template {

    constructor(...args) {
        super(...args)
        this.init()
    }
    properties = {
        cmpSelection: new Prop('{}', (cmpSelection) => {
            if (Object.keys(cmpSelection).length > 0) {
                this.children.childPropEditor.hidden = false
                this.children.ownPropEditor.hidden = true
            } else {
                this.children.childPropEditor.hidden = true
                this.children.ownPropEditor.hidden = false
            }
            this.children.positionPropEditor.properties.cmpSelection.value = cmpSelection
            this.children.childPropEditor.properties.cmpSelection.value = cmpSelection
        }),
        componentAst: new Prop('null'),
    }

    static defaultSize = [300, 1000]
    children  = {
        positionPropEditor: new PositionPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px', height: '150px'},
            props: {cmpSelection: 'cmpSelection'},
        }),
        childPropEditor: new ChildPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '160px', height: '140px'},
            props: {hidden: 'true'},
        }),
        ownPropEditor: new OwnPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '300px', height: '140px'},
            properties: {
                componentAst: 'Prop("componentAst")',
            }
        }),
        stylePropEditor: new StylePropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '440px', height: '140px'},
        }),
    }

    recalcPositionParameters() {
        this.children.positionPropEditor.recalcPositionParameters()
    }
}

export default PropEditor