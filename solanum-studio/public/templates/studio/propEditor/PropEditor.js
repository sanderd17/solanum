import Template from "/lib/template.js"
import Checkbox from '/templates/forms/Checkbox.js'
import Textbox from '/templates/forms/Textbox.js'

class PropEditor extends Template {

    static childDefinitions  = {
        leftActive: {
            type: Checkbox,
            position: { left: '0px', top: '0px', height: '20px', width: '100px' },
            props: {
                text: 'Left',
                disabled: true
            },
            eventHandlers: {},
            styles: []
        },
        rightActive: {
            type: Checkbox,
            position: { left: '0px', top: '25px', height: '20px', width: '100px' },
            props: {
                text: 'Right',
                disabled: true
            },
            eventHandlers: {},
            styles: []
        },
        widthActive: {
            type: Checkbox,
            position: { left: '0px', top: '50px', height: '20px', width: '100px' },
            props: {
                text: 'Width',
                disabled: true
            },
            eventHandlers: {},
            styles: []
        },
        topActive: {
            type: Checkbox,
            position: { left: '0px', top: '75px', height: '20px', width: '100px' },
            props: {
                text: 'Top',
                disabled: true
            },
            eventHandlers: {},
            styles: []
        },
        bottomActive: {
            type: Checkbox,
            position: { left: '0px', top: '100px', height: '20px', width: '100px' },
            props: {
                text: 'Bottom',
                disabled: true
            },
            eventHandlers: {},
            styles: []
        },
        heightActive: {
            type: Checkbox,
            position: { left: '0px', top: '125px', height: '20px', width: '100px' },
            props: {
                text: 'Height',
                disabled: true
            },
            eventHandlers: {},
            styles: []
        },
        leftValue: {
            type: Textbox,
            position: { left: '120px', top: '0px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev) => console.log(ev) },
            styles: []
        },
        rightValue: {
            type: Textbox,
            position: { left: '120px', top: '25px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev) => console.log(ev) },
            styles: []
        },
        widthValue: {
            type: Textbox,
            position: { left: '120px', top: '50px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev) => console.log(ev) },
            styles: []
        },
        topValue: {
            type: Textbox,
            position: { left: '120px', top: '75px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev) => console.log(ev) },
            styles: []
        },
        bottomValue: {
            type: Textbox,
            position: { left: '120px', top: '100px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev) => console.log(ev) },
            styles: []
        },
        heightValue: {
            type: Textbox,
            position: { left: '120px', top: '125px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev) => console.log(ev) },
            styles: []
        }

    }

    /**
     * @type {Array<Template>}
     */
    _cmpSelection = []
    set cmpSelection(cmpSelection) {
        this._cmpSelection = cmpSelection

        for (let p of ['left', 'right', 'width', 'top', 'bottom', 'height']) {
            let enabled = true
            let text = null
            for (let cmp of cmpSelection) {
                if (p in cmp.position) {
                    if (text == null || text == cmp.position[p]) {
                        text = cmp.position[p]
                    } else {
                        text = ''
                    }
                } else {
                    enabled = false
                }
            }
            this.children[p + 'Value'].disabled = !enabled
            this.children[p + 'Value'].value = text || ''
            this.children[p + 'Active'].checked = enabled
            this.children[p + 'Active'].disabled = !enabled
        }
    }

    get cmpSelection() {
        return this._cmpSelection
    }
}

export default PropEditor