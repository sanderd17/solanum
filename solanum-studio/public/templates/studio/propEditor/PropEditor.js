import Template from "/lib/template.js"
import Checkbox from '/templates/forms/Checkbox.js'
import Textbox from '/templates/forms/Textbox.js'

class PropEditor extends Template {

    static childDefinitions  = {
        chkLeft: {
            type: Checkbox,
            position: {
                left: '0px', top: '0px', height: '20px', width: '100px'
            },
            props: {
                text: 'Left'
            },
            eventHandlers: {

            },
            styles: [

            ]
        },
        txtLeft: {
            type: Textbox,
            position: {
                left: '120px',
                top: '0px',
                height: '20px',
                right: '0px',
            },
            props: {
                value: '123px',
            },
            eventHandlers: {
                change: (ev) => console.log(ev)
            },
            styles: [

            ]
        }

    }
}

export default PropEditor