import Template from "/lib/template.js"
import Checkbox from '/templates/forms/Checkbox.js'
import Textbox from '/templates/forms/Textbox.js'

class PositionPropEditor extends Template {

    static defaultSize = [300, 150]
    children  = {
        leftActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '0px', height: '20px', width: '100px' },
            props: {
                text: 'Left',
                disabled: true
            },
            eventHandlers: {},
        }),
        rightActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '25px', height: '20px', width: '100px' },
            props: {
                text: 'Right',
                disabled: true
            },
            eventHandlers: {},
        }),
        widthActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '50px', height: '20px', width: '100px' },
            props: {
                text: 'Width',
                disabled: true
            },
            eventHandlers: {},
        }),
        topActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '75px', height: '20px', width: '100px' },
            props: {
                text: 'Top',
                disabled: true
            },
            eventHandlers: {},
        }),
        bottomActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '100px', height: '20px', width: '100px' },
            props: {
                text: 'Bottom',
                disabled: true
            },
            eventHandlers: {},
        }),
        heightActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '125px', height: '20px', width: '100px' },
            props: {
                text: 'Height',
                disabled: true
            },
            eventHandlers: {},
        }),
        leftValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '0px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'left') },
        }),
        rightValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '25px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'right') },
        }),
        widthValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '50px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'width') },
        }),
        topValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '75px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'top') },
        }),
        bottomValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '100px', height: '20px', right: '0px' },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'bottom') },
        }),
        heightValue: new Textbox({
            parent: this,
            position: {
                left: "120px",
                top: "125px",
                height: "20px",
                right: "0px"
            },
            props: { disabled: true },
            eventHandlers: { change: (ev, root, child) => root.setPositionValue(child, 'height') },
        }),
    }

    /**
     * 
     * @param {Textbox} child 
     * @param {stirng} type 
     */
    async setPositionValue(textBox, type) {
        for (let [childId, child] of Object.entries(this.cmpSelection)) {
            let newPosition = {...child.position}
            newPosition[type] = textBox.value
            this.dom.dispatchEvent(new CustomEvent('positionpropchanged', {
                bubbles: true,
                detail: {childId, newPosition}
            }))
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

export default PositionPropEditor