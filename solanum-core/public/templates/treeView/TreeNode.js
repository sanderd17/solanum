import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import Icon from '/templates/draw/Icon.js'
import Tree from '/templates/treeView/Tree.js'

class TreeNode extends Template {
    properties = {
        indentation: new Prop("5"),
        isOpen: new Prop('false', (isOpen) => {
            // add parent in a lazy way
            if (isOpen && !this.children.tree) {
                let tmpHeight = this.children.template.height
                let tree = new Tree({
                    parent: this,
                    position: {left: this.prop.indentation + 'px', right: '0px', top: tmpHeight + 'px'},
                    properties: {indentation: "Prop('indentation')"},
                    style: {visibility: "Prop('isOpen') ? 'visible' : 'hidden'"}
                })
                tree.initTree(this.subtree)
                this.addChild('tree', tree)
            }
            this.dispatchEvent('heightChanged')
        })
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
    }

    setSubtree(subtree) {
        if (this.subtree) {
            // remove the existing tree
            if (this.children.tree) {
                this.children.tree.destroy()
            }
        } else {
            // add a new open/close icon
            let icon = new Icon({
                parent: this,
                position: {left: '0px', top: '0px', width: '25px', height: '25px'},
                properties: {
                    iconSet: '"material-design"',
                    iconPath: 'Prop("isOpen") ? "navigation/svg/production/ic_expand_more_24px.svg" : "navigation/svg/production/ic_chevron_right_24px.svg"'
                },
                eventHandlers: {click: () => {this.prop.isOpen = !this.prop.isOpen}}
            })
            this.addChild('icon', icon)
        }
        this.subtree = subtree
        // actual subtree will be added in a lazy way
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