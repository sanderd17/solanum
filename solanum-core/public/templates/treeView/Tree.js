import Template from '/lib/template.js'
import Prop from '/lib/ComponentProp.js'
import TreeNode from './TreeNode.js'

const wait = async (ms) => {return new Promise(resolve => setTimeout(resolve, ms))}


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
     * @param {[]} tree 
     * @param {number?} index Starting index of the tree, will be used on recursive calls when the tree takes too long to build
     */
    initTree(tree, index) { // TODO why pass the tree here? can we figure out props that have access to the tempates? Have access to 'this' as the binding definer?
        const batchsize = 100
        const maxTime = 50 //ms
        let startTime = +(new Date())
        this.tree = tree // TODO allow altering tree nodes?
        index = index || 0
        while (index < tree.length) {
            if (+(new Date()) - startTime > maxTime) {
                break
            }
            let el = tree[index]
            let node = new TreeNode({
                parent: this,
                properties: {
                    indentation: "Prop('indentation')",
                },
                eventHandlers: {
                    heightChanged: () => this.repositionChildren(),
                    getSubtree: async () => {
                        // FIXME dirty hack to pass a function, functions should ideally be passable as arguments
                        if (el.subtree) {
                            return el.subtree
                        } else if (el.getSubtree) {
                            return await el.getSubtree()
                        }
                        return []
                    }
                },
            })

            let template = new el.template(el.templateArgs)
            node.setTemplate(template)
            this.addChild(el.id, node)
            index++
        }
        requestAnimationFrame(() => {
            this.repositionChildren()
            this.dispatchEvent('heightChanged')
        })
        if (index < tree.length) {
            // process the following batch after a given timer
            setTimeout(() => this.initTree(tree, index), 0)
        }
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