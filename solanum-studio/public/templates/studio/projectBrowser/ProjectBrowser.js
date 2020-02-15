import Template from "/lib/template.js"
import Label from "/templates/forms/Label.js"
import Tree from "/templates/treeView/Tree.js"

class ProjectBrowser extends Template {
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
        //this.loadComponents()
        this.init()
        this.loadComponents()
    }

    /**
     * 
     * @param {string} mod 
     * @param {string} cmp 
     * @param {Array} tree 
     * @param {Array<string>} [path]
     */
    addComponentToTree(mod, cmp, tree, path) {
        if (path == undefined)
            path = cmp.split('/')

        let [name, ...nextPath] = path

        // search the node with that name in the existing tree
        let cmpNode = null
        for (let node of tree) {
            if (node.id == name) {
                cmpNode = node
                break
            }
        }
        // if not found, make a new node in the tree
        if (!cmpNode) {
            cmpNode = {
                id: name,
                template: Label,
                templateArgs: {
                    position: {height: '25px'},
                    properties: {
                        text: JSON.stringify(name),
                        draggable: 'true',
                    },
                }
            }
            tree.push(cmpNode)
            tree.sort((n1, n2) => n1.id < n2.id ? -1 : (n1.id > n2.id ? 1 : 0))
        }
        if (nextPath.length == 0) {
            // tree leaf, add click handlers
            cmpNode.templateArgs.eventHandlers = {
                dblclick: () => this.openComponent(mod, cmp),
                dragstart: (ev) => {
                    ev.dataTransfer.setData('newComponent', cmp)
                    ev.dataTransfer.setData('module', mod)
                    this.draggedComponent = cmp
                },
            }
        } else {
            // non leaf, add a subtree
            let subtree = cmpNode.subtree
            if (!subtree) {
                subtree = []
                cmpNode.subtree = subtree
            }
            this.addComponentToTree(mod, cmp, subtree, nextPath)
        }
    }

    async loadComponents() {
        let tree = []
        let response = await fetch('/API/studio/getComponentPaths', {
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
        })
        let modules = await response.json()
        for (let mod in modules) {
            let moduleNode = {
                id: mod,
                template: Label,
                templateArgs: {
                    position: {height: '25px'},
                    properties: {
                        text: JSON.stringify(mod)
                    },
                }
            }
            tree.push(moduleNode)
            let subtree = []
            let components = modules[mod]
            for (let cmp of components) {
                this.addComponentToTree(mod, cmp, subtree)
            }
            moduleNode.subtree = subtree
        }
        console.log(tree)
        this.children.tree.initTree(tree)
    }

    openComponent(mod, cmp) {
        this.dispatchEvent("openComponent", {mod, cmp})
    }
}

export default ProjectBrowser