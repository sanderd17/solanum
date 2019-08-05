import Template from "/lib/template.js"
import PositionPropEditor from '/templates/studio/propEditor/PositionPropEditor.js'
import StylePropEditor from '/templates/studio/propEditor/StylePropEditor.js'

class PropEditor extends Template {

    static defaultSize = [300, 1000]
    children  = {
        positionPropEditor: new PositionPropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px', height: '150px'}
        }),
        stylePropEditor: new StylePropEditor({
            parent: this,
            position: {left: '0px', right: '0px', top: '150px', height: '150px'}
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
        this.children.positionPropEditor.cmpSelection = cmpSelection
    }

    get cmpSelection() {
        return this._cmpSelection
    }
}

export default PropEditor