import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import TitleBar from './TitleBar.js'

const TITLE_HEIGHT = 15

class CollapsibleTemplate extends Template {
    properties = {
        collapsed: new Prop(false, (collapsed) => {
            if (this.children.subTemplate)
                this.children.subTemplate.style.visibility = collapsed? 'hidden' : 'visible'
            this.dispatchEvent('heightChanged')
        }),
        title: new Prop("Title"),
    }

    children = {
        titleBar: new TitleBar({
            parent: this,
            position: {left: '0px', width: '100%', top: '0px', height: TITLE_HEIGHT + 'px'},
            properties: {
                title: ({Prop}) => (Prop('collapsed') ? '[+] ' : '[-] ') +  Prop('title'),
            },
            eventHandlers: {
                click: (ev) => {
                    ev.stopPropagation()
                    this.prop.collapsed = !this.prop.collapsed
                }
            },
            style: {
                background: "'grey'",
            }
        }),
        /** @type {Template?} */
        subTemplate: null
    }

    constructor(args) {
        super(args)
        this.init()
    }

    /**
     * @param {Template} tmp
     */
    setTemplate(tmp) {
        tmp.style.top = TITLE_HEIGHT + 'px'
        tmp.style.visibility = this.prop.collapsed ? 'hidden' : 'visible'
        this.addChild('subTemplate', tmp)
    }

    /**
     * Override the height property to depend on the child heights
     * Height is not settable
     */
    get height() {
        let height = this.children.titleBar.height
        if (!this.prop.collapsed) {
            height += this.children.subTemplate.height
        }
        return height
    }
}

export default CollapsibleTemplate