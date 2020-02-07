import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import CollapsibleTemplate from '/templates/containers/CollapsibleTemplate.js'

/**
 * @typedef {Object} CollapsibleChild
 * @property {string} title
 * @property {Template} template
 * @property {[boolean]} collapsed
 */

class CollapseList extends Template {
    constructor(args) {
        super(args)
        this.init()
        /** @type {CollapsibleTemplate[]} */
        this.orderedChildren = []
    }

    /**
     * @param {CollapsibleChild[]} templates 
     */
    setTemplates(templates) {
        this.orderedChildren = []
        for (let [i, conf] of Object.entries(templates)) {
            let tmp = new CollapsibleTemplate({
                parent: this,
                position: {left: '0px', width: '100%', top: '0px', height: '100px'},
                properties: {
                    title: JSON.stringify(conf.title),
                    collapsed: JSON.stringify(conf.collapsed),
                },
                eventHandlers: {
                    heightChanged: () => this.repositionChildren()
                }
            })
            tmp.setTemplate(conf.template)
            this.orderedChildren.push(tmp)
            this.addChild(i, tmp)
        }
        setTimeout(() => this.repositionChildren())
    }

    repositionChildren() {
        let currentPos = 0
        for (let child of this.orderedChildren) {
            let height = child.height
            child.setPosition({left: '0px', right: '0px', top: currentPos + 'px', height: height + 'px'})
            currentPos += height
        }
    }
}

export default CollapseList