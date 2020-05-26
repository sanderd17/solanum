import Template from "/lib/template.js"
import Label from '/templates/forms/Label.js'
import Textbox from '/templates/forms/Textbox.js'
import Prop from '/lib/ComponentProp.js'

class TagParameters extends Template {

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

            for (let childId in this.children) {
                this.removeChild(childId)
            }

            for (let i = 0; i < tagParams.description.length; i++) {
                let paramName = tagParams.description[i].name
                this.addChild("label" + i, new Label({
                    parent: this,
                    position: {left: '0px', width: '150px', top: (i*25) + 'px', height: '20px'},
                    properties: {
                        text: paramName,
                    },
                    eventHandlers: {},
                }))

                this.addChild("label" + i, new Textbox({
                    parent: this,
                    position: {left: '150px', width: '300px', top: (i*25) + 'px', height: '20px'},
                    properties: {
                        value: tagParams.values[paramName] || '',
                    },
                    eventHandlers: {},
                }))
            }
            //this.children.input.prop.value = tagParams.defaultValue
        })
    }
}

export default TagParameters