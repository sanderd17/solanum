import Template from "/lib/template.js"
import TagTreeElement from "./TagTreeElement.js"
import Tree from "/templates/treeView/Tree.js"

class TagBrowser extends Template {

    static styles = {
        'overflow': 'scroll'
    }

    children = {
        tree: new Tree({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px'},
        })
    }

    constructor(args) {
        super(args)
        this.init()
        this.loadTags()
    }

    async loadTags() {
        let tree = await this.getTagTree('')
        this.children.tree.initTree(tree)
        this.children.tree.repositionChildren()
    }

    /**
     * @param {string} parentpath
     */
    async getTagTree(parentpath) {
        let response = await fetch('/API/studio/getSubTags?parentpath=' + encodeURIComponent(parentpath), {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'same-origin', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            //body: JSON.stringify(parentpath)
        })
        let tagpaths = await response.json()
        let tree = []
        for (let child of tagpaths) {

            let cmpNode = {
                id: child.name,
                template: TagTreeElement,
                templateArgs: {
                    position: {height: '25px'},
                    properties: {
                        text: child.name,
                        tagpath: child.path,
                        draggable: true,
                    },
                },
                getSubtree: async () => {
                    return await this.getTagTree(child.path)
                }
            }
            tree.push(cmpNode)
        }
        return tree
    }
}

export default TagBrowser