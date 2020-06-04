import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import Icon from '/templates/draw/Icon.js'
import Label from '/templates/forms/Label.js'
import Tree from '/templates/treeView/Tree.js'



class TreeNode extends Template {
    properties = {
        indentation: new Prop(5),
        isOpen: new Prop(false),
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
        let icon = new Label({
            parent: this,
            position: {left: '5px', top: '0px', width: '15px', height: '15px'},
            properties: {
                text: () => this.prop.isOpen ? "⊟" : "⊞",
            },
            style: {visibility: 'hidden'},
            eventHandlers: {
                click: () => {
                    if (!this.tree) {
                        return // tree not loaded yet
                    }
                    this.prop.isOpen = !this.prop.isOpen
                    if (this.children.tree) {
                        this.dispatchEvent('heightChanged')
                    } else if (this.prop.isOpen) {
                        // create the tree
                        let tmpHeight = this.children.template.height
                        let tree = new Tree({
                            parent: this,
                            position: {left: this.prop.indentation + 'px', right: '0px', top: tmpHeight + 'px'},
                            properties: {indentation: () => this.prop.indentation},
                            style: {visibility: () => this.prop.isOpen ? 'inherit' : 'hidden'},
                        })
                        tree.initTree(this.tree)
                        this.addChild('tree', tree)
                    }
                },
                intersectionChangeObserved: async (ev) => {
                    if (this.tree || !ev.detail.isIntersecting)
                        return

                    this.tree = await this.eventHandlers.getSubtree()

                    if (this.tree && this.tree.length > 0) {
                        this.children.icon.style.visibility = 'inherit'
                    }
                }
            },
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