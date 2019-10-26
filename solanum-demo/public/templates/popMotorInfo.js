import Template from '/lib/template.js'
import ts from '/lib/TagSet.js'
import Button from '/templates/forms/Button.js'

class PopMotorInfo extends Template {
    children = {
        btnStart: new Button({
            parent: this,
            position: {left: '10%', right: '10%', top: '10px', height: '25px'},
            props: {text: '"Start"'},
            eventHandlers: {
                click: (ev, root) => ts.writeTag(root.path, 'lightgreen')
            }
        }),
        btnStop: new Button({
            parent: this,
            position: {left: '10%', right: '10%', top: '40px', height: '25px'},
            props: {text: '"Stop"'},
            eventHandlers: {
                click: (ev, root) => ts.writeTag(root.path, 'gray')
            }
        }),
    }

    static defaultSize = [100, 200]
}

export default PopMotorInfo