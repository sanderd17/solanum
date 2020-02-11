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
            console.log(mod)
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
                let cmpNode = {
                    id: cmp,
                    template: Label,
                    templateArgs: {
                        position: {height: '25px'},
                        properties: {
                            text: JSON.stringify(cmp),
                            draggable: 'true',
                        },
                        eventHandlers: {
                            dblclick: () => this.openComponent(mod, cmp),
                            dragstart: (ev) => {
                                ev.dataTransfer.setData('newComponent', cmp)
                                ev.dataTransfer.setData('module', mod)
                                this.draggedComponent = cmp
                            },
                        },
                    }
                }
                subtree.push(cmpNode)
            }
            moduleNode.subtree = subtree
        }
        this.children.tree.initTree(tree)
    }

    openComponent(mod, cmp) {
        this.dispatchEvent("openComponent", {mod, cmp})
    }
}

export default ProjectBrowser