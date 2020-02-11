import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import TreeNode from './TreeNode.js'


/**
 * Tree data example
 * - array determines the order
 * - ids can be used as the path, must be unique for sibling nodes
 * - Templates are passed as a constructor with arguments, so they can be created in a lazy way
 *   - Position argument will be overridden, it will always be
 *     - Top: based on order and height of previous
 *     - Height: based on template size
 *     - Left: from 0px onwards, based on indendation property
 *     - Right: 0px
 * - TODO what with the parent? properties should bind to what? Maybe parent is a bad name
 */
[
    {
        id: 'id1',
        template: Template,
        templateArgs: {
            properties: {
                label: "'xxx'",
            },
        },
        subtree: [
            {
                id: 'id2',
                getSubTree: async () => {}, // dynamic subtree from an async call
                //...
            }
        ]
    }
]


class Tree extends Template {
    properties = {
        indentation: new Prop("5"),
    }

    constructor(args) {
        super(args)
        this.init()
    }

    /**
     * @param {*} tree 
     */
    initTree(tree) { // TODO why pass the tree here? can we figure out props that have access to the tempates? Have access to 'this' as the binding definer?
        this.tree = tree // TODO allow altering tree nodes?
        for (let el of tree) {
            let node = new TreeNode({
                parent: this,
                properties: {indentation: "Prop('indentation')"},
                eventHandlers: {
                    heightChanged: () => this.repositionChildren()
                },
            })

            let template = new el.template(el.templateArgs)
            node.setTemplate(template)
            this.addChild(el.id, node)
            if (el.subtree) {
                node.setSubtree(el.subtree)
            } else if (el.getSubtree) {
                el.getSubtree()
                    .then(subtree => node.setSubtree(subtree))
                    .catch(err => console.error(`Error reading subtree ${el.id}`, err))
            }
        }
        setTimeout(() => this.repositionChildren())
    }

    repositionChildren() {
        let currentPos = 0
        for (let el of this.tree) {
            let child = this.children[el.id]
            if (!child) // TODO don't get called during init
                return
            child.style.top = currentPos + 'px'
            let height = child.height
            //child.setPosition({left: '0px', right: '0px', top: currentPos + 'px', height: height + 'px'})
            currentPos += height
        }
    }
    get height() {
        let height = 0
        for (let childId in this.children) {
            height += this.children[childId].height
        }
        return height
    }
}

export default Tree