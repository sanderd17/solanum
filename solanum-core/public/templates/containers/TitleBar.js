import Template from '/lib/template.js'
import Prop, {StyleProp} from '/lib/ComponentProp.js'

class TitleBar extends Template {
    properties = {
        title: new Prop("'Title'", (newTitle) => {
            this.dom.innerHTML = newTitle
        }),
        height: new Prop('"15px"')
    }

    static styles = {
        backgroundColor: 'darkgrey',
        color: 'white'
    }

    constructor(args) {
        super(args)
        this.init()
    }
}

export default TitleBar