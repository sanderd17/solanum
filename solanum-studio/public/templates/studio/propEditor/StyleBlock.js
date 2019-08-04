import Template from "/lib/template.js"
import ToggleButton from "/templates/forms/ToggleButton.js"
import Textbox from "/templates/forms/Textbox.js"

class StyleBlock extends Template {

    static defaultSize = [300, 300]

    static stateList = ['hover', 'active', 'focus']

    children = {
        tglHov: new ToggleButton({
            parent: this,
            position: {right: '0px', width: '50px', top: '0px', height: '20px'},
            props: {
                text: ':hov'
            }
        }),
        tglAct: new ToggleButton({
            parent: this,
            position: {right: '55px', width: '50px', top: '0px', height: '20px'},
            props: {
                text: ':act'
            }
        }),
        tglFoc: new ToggleButton({
            parent: this,
            position: {right: '110px', width: '50px', top: '0px', height: '20px'},
            props: {
                text: ':foc'
            }
        }),
        txtClasses: new Textbox({
            parent: this,
            position: {left: '0px', width: '100%', top: '25px', height: '20px'},
            props: {

            }
        })
    }

    /*
    example block:
    {
        states: ['hover'],
        classes: ['test'],
        declarations: {
            'cursor': 'pointer',
        }
    },
    */
    _styleBlock = []

    set styleBlock(styleBlock) {
        this._styleBlock = styleBlock

        // Create new block per set of declarations


    }

    get styleBlock() {
        return this._styleBlock
    }


}

export default StyleBlock