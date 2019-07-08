import Template from "/lib/template.js"
import Checkbox from '/templates/forms/Checkbox.js'

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
        }
    }
}

export default PropEditor