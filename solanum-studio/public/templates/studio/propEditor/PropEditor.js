import Template from "/lib/template.js"
import Checkbox from '/templates/forms/Checkbox.js'
import Textbox from '/templates/forms/Textbox.js'
import callStudioApi from '/lib/studioApi.js'

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
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'left') },
            styles: []
        },
        rightValue: {
            type: Textbox,
            position: { left: '120px', top: '25px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'right') },
            styles: []
        },
        widthValue: {
            type: Textbox,
            position: { left: '120px', top: '50px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'width') },
            styles: []
        },
        topValue: {
            type: Textbox,
            position: { left: '120px', top: '75px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'top') },
            styles: []
        },
        bottomValue: {
            type: Textbox,
            position: { left: '120px', top: '100px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'bottom') },
            styles: []
        },
        heightValue: {
            type: Textbox,
            position: { left: '120px', top: '125px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'height') },
            styles: []
        }

    }

    /**
     * 
     * @param {Textbox} child 
     * @param {stirng} type 
     */
    async setPositionValue(child, type) {
        console.log(child.value, type)
        for (let [childId, child] of Object.entries(this.cmpSelection)) {
            let position = {}
            await callStudioApi('main', 'Motor.js', 'setChildPosition', {childId, position})
        }
    }

    recalcPositionParameters() {
        for (let p of ['left', 'right', 'width', 'top', 'bottom', 'height']) {
            let enabled = false
            let text = null
            for (let cmp of Object.values(this.cmpSelection)) {
                if (p in cmp.position) {
                    if (text == null || text == cmp.position[p]) {
                        text = cmp.position[p]
                    } else {
                        text = ''
                    }
                    enabled = true
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

    /**
     * @type {Object<string, Template>}
     */
    _cmpSelection = []
    set cmpSelection(cmpSelection) {
        this._cmpSelection = cmpSelection
        this.recalcPositionParameters()
    }

    get cmpSelection() {
        return this._cmpSelection
    }
}

export default PropEditor