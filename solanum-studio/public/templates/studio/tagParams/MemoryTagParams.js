import Template from "/lib/template.js"
import Label from '/templates/forms/Label.js'
import Textbox from '/templates/forms/Textbox.js'
import Prop from '/lib/ComponentProp.js'

class MemoryTagParameters extends Template {

    constructor(args) {
        super(args)
        this.init()
    }

    properties = {
        tagpath: new Prop('', async (newValue) => {
            console.log(newValue)
            let response = await fetch(`/API/Studio/getTagParams?tagpath=${newValue}`)
            let tagParams = await response.json()
            console.log(tagParams)
            this.children.input.prop.value = tagParams.defaultValue
        })
    }

    children = {
        label: new Label({
            parent: this,
            position: {left: '0px', width: '150px', top: '0px', height: '20px'},
            properties: {
                text: 'defaultValue',
            },
            eventHandlers: {
                click: () => {
                    this.dispatchEvent('selectionchanged', {selection: this.prop.tagpath})
                }
            },
        }),
        input: new Textbox({
            parent: this,
            position: {left: '150px', width: '300px', top: '0px', height: '20px'},
            properties: {

            },
            eventHandlers: {

            },
        })
    }
}

export default MemoryTagParameters