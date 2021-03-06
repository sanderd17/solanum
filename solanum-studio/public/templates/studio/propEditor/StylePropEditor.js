import Template from "/lib/template.js"
import StyleBlock from "/templates/studio/propEditor/StyleBlock.js"

class StylePropEditor extends Template {

    constructor(...args) {
        super(...args)
        this.init()
    }

    static defaultSize = [300, 300]

    static stateList = ['hover', 'active', 'focus']

    children = {
        block_1: new StyleBlock({
            parent: this,
            position: {left: '0%', width: '100%', top:'0%', height: '300px'}
        })
    }

    /*
    example list:
    [
            {
                declarations: {
                    'stroke': 'black',
                    'stroke-width': '2px',
                }
            },
            {
                states: ['hover'],
                declarations: {
                    'cursor': 'pointer',
                }
            },
            {
                classes: ['test'],
                delcarations: {
                    ...
                }
            }
        ]
    */
    _effectsList = []

    set effectsList(effectsList) {
        this._effectsList = effectsList
        if (effectsList.length > 0) {
            this.children.block_1.styleBlock = effectsList[0]
        }
        // Create new block per set of declarations
    }

    get effectsList() {
        return this._effectsList
    }


}

export default StylePropEditor