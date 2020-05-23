import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import Checkbox from '/templates/forms/Checkbox.js'
import Textbox from '/templates/forms/Textbox.js'

class PositionPropEditor extends Template {

    properties = {
        cmpSelection: new Prop({}, () => {
            this.recalcPositionParameters()
        })
    }
    constructor(...args) {
        super(...args)
        this.init()
    }

    static defaultSize = [300, 150]
    children  = {
        leftActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '0px', height: '20px', width: '100px' },
            properties: {
                text: 'Left',
                disabled: true,
            },
            eventHandlers: {},
        }),
        rightActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '25px', height: '20px', width: '100px' },
            properties: {
                text: 'Right',
                disabled: true,
            },
            eventHandlers: {},
        }),
        widthActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '50px', height: '20px', width: '100px' },
            properties: {
                text: 'Width',
                disabled: true,
            },
            eventHandlers: {},
        }),
        topActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '75px', height: '20px', width: '100px' },
            properties: {
                text: 'Top',
                disabled: true,
            },
            eventHandlers: {},
        }),
        bottomActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '100px', height: '20px', width: '100px' },
            properties: {
                text: 'Bottom',
                disabled: true,
            },
            eventHandlers: {},
        }),
        heightActive: new Checkbox({
            parent: this,
            position: { left: '0px', top: '125px', height: '20px', width: '100px' },
            properties: {
                text: 'Height',
                disabled: true,
            },
            eventHandlers: {},
        }),
        leftValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '0px', height: '20px', right: '0px' },
            properties: { disabled: true },
            eventHandlers: { change: (ev, child) => this.setPositionValue(child, 'left') },
        }),
        rightValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '25px', height: '20px', right: '0px' },
            properties: { disabled: true },
            eventHandlers: { change: (ev, child) => this.setPositionValue(child, 'right') },
        }),
        widthValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '50px', height: '20px', right: '0px' },
            properties: { disabled: true },
            eventHandlers: { change: (ev, child) => this.setPositionValue(child, 'width') },
        }),
        topValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '75px', height: '20px', right: '0px' },
            properties: { disabled: true },
            eventHandlers: { change: (ev, child) => this.setPositionValue(child, 'top') },
        }),
        bottomValue: new Textbox({
            parent: this,
            position: { left: '120px', top: '100px', height: '20px', right: '0px' },
            properties: { disabled: true },
            eventHandlers: { change: (ev, child) => this.setPositionValue(child, 'bottom') },
        }),
        heightValue: new Textbox({
            parent: this,
            position: {
                left: "120px",
                top: "125px",
                height: "20px",
                right: "0px"
            },
            properties: { disabled: true },
            eventHandlers: { change: (ev, child) => this.setPositionValue(child, 'height') },
        }),
    }

    /**
     * 
     * @param {Textbox} child 
     * @param {string} type 
     */
    async setPositionValue(textBox, type) {
        for (let [childId, child] of Object.entries(this.prop.cmpSelection)) {
            let newPosition = {...child.__position}
            newPosition[type] = textBox.prop.value
            this.dispatchEvent('positionpropchanged', {childId, newPosition})
        }
    }

    recalcPositionParameters() {
        for (let p of ['left', 'right', 'width', 'top', 'bottom', 'height']) {
            let enabled = false
            let text = null
            for (let cmp of Object.values(this.prop.cmpSelection)) {
                if (p in cmp.__position) {
                    if (text == null || text == cmp.__position[p]) {
                        text = cmp.__position[p]
                    } else {
                        text = ''
                    }
                    enabled = true
                } else {
                    enabled = false
                }
            }
            this.children[p + 'Value'].prop.disabled = !enabled
            this.children[p + 'Value'].prop.value = text || ''
            this.children[p + 'Active'].prop.checked = enabled
            this.children[p + 'Active'].prop.disabled = !enabled
        }
    }
}

export default PositionPropEditor