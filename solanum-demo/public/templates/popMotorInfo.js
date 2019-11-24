import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Button from '/templates/forms/Button.js'
import Prop from '/lib/ComponentProp.js'

class PopMotorInfo extends Template {
    properties = {
        path: new Prop("''")
    }

    children = {
        btnStart: new Button({
            parent: this,
            position: {left: '10%', right: '10%', top: '10px', height: '25px'},
            properties: {text: '"Start"'},
            eventHandlers: {
                click: (ev, root) => {
                    console.log(root.p.path.value)
                    ts.writeTag(root.p.path.value, 'lightgreen')
                }
            }
        }),
        btnStop: new Button({
            parent: this,
            position: {left: '10%', right: '10%', top: '40px', height: '25px'},
            properties: {text: '"Stop"'},
            eventHandlers: {
                click: (ev, root) => ts.writeTag(root.p.path.value, 'gray')
            }
        }),
    }

    static defaultSize = [100, 200]
}

export default PopMotorInfo