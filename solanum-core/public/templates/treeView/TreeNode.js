import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import Icon from '/templates/draw/Icon.js'
import Tree from '/templates/treeView/Tree.js'

class TreeNode extends Template {
    properties = {
        indentation: new Prop("5"),
        isOpen: new Prop('false'),
    }

    constructor(args) {
        super(args)
        this.init()
    }

    /**
     * 
     * @param {Template} template 
     */
    setTemplate(template) {
        template.style.left = '25px'
        template.style.top = '0px'
        template.style.right = '0px'
        this.addChild('template', template)
        let icon = new Icon({
            parent: this,
            position: {left: '0px', top: '0px', width: '25px', height: '25px'},
            properties: {
                iconSet: '"material-design"',
                iconPath: 'Prop("isOpen") ? "navigation/svg/production/ic_expand_more_24px.svg" : "navigation/svg/production/ic_chevron_right_24px.svg"'
            },
            eventHandlers: {click: async () => {
                this.prop.isOpen = !this.prop.isOpen
                if (this.prop.isOpen && !this.children.tree) {
                    let subtree = await this.eventHandlers.getSubtree()
                    let tmpHeight = this.children.template.height
                    let tree = new Tree({
                        parent: this,
                        position: {left: this.prop.indentation + 'px', right: '0px', top: tmpHeight + 'px'},
                        properties: {indentation: "Prop('indentation')"},
                        style: {visibility: "Prop('isOpen') ? 'inherit' : 'hidden'"}
                    })
                    tree.initTree(subtree)
                    this.addChild('tree', tree)
                }
                this.dispatchEvent('heightChanged')
            }}
        })
        this.addChild('icon', icon)
    }

    setSubtree(subtree) {
        if (this.subtree && this.children.tree) {
            this.children.tree.destroy()
        }
        this.subtree = subtree
    }

    /**
     * Override height to get the height of the node + subtree
     */
    get height() {
        let height = this.children.template.height
        if (this.prop.isOpen && this.children.tree) {
            height += this.children.tree.height
        }
        return height
    }
}

export default TreeNode