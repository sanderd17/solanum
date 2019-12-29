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
        cmpSelection: new Prop('{}'),
        componentInfo: new Prop('null'),
    }

    static defaultSize = [300, 1000]
    children  = {
        positionPropEditor: new PositionPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px', height: '150px'},
            properties: {cmpSelection: "Prop('cmpSelection')"},
        }),
        childPropEditor: new ChildPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '160px', height: '140px'},
            properties: {
                cmpSelection: 'Prop("cmpSelection")',
                componentInfo: 'Prop("componentInfo")',
            },
        }),
        ownPropEditor: new OwnPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '300px', height: '140px'},
            properties: {
                componentInfo: 'Prop("componentInfo")',
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