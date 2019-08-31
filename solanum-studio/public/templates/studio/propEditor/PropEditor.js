import Template from "/lib/template.js"
import PositionPropEditor from '/templates/studio/propEditor/PositionPropEditor.js'
import ChildPropEditor from '/templates/studio/propEditor/ChildPropEditor.js'
import OwnPropEditor from '/templates/studio/propEditor/OwnPropEditor.js'
import StylePropEditor from '/templates/studio/propEditor/StylePropEditor.js'

class PropEditor extends Template {

    static defaultSize = [300, 1000]
    children  = {
        positionPropEditor: new PositionPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px', height: '150px'}
        }),
        childPropEditor: new ChildPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '160px', height: '150px'},
            props: {hidden: true},
        }),
        ownPropEditor: new OwnPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '160px', height: '150px'}
        }),
        stylePropEditor: new StylePropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '320px', height: '150px'}
        }),
    }

    recalcPositionParameters() {
        this.children.positionPropEditor.recalcPositionParameters()
    }

    /**
     * @type {Object<string, Template>}
     */
    _cmpSelection = []
    set cmpSelection(cmpSelection) {
        this._cmpSelection = cmpSelection
        if (Object.keys(cmpSelection).length > 0) {
            this.children.childPropEditor.hidden = false
            this.children.ownPropEditor.hidden = true
        } else {
            this.children.childPropEditor.hidden = true
            this.children.ownPropEditor.hidden = false
        }
        this.children.positionPropEditor.cmpSelection = cmpSelection
        this.children.childPropEditor.cmpSelection = cmpSelection
    }

    get cmpSelection() {
        return this._cmpSelection
    }
}

export default PropEditor