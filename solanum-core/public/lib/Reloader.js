import messager from './Messager.js'

function recursiveCheckClass(root, cls) {
    for (let id in root.children) {
        let child = root.children[id]
        if (child.constructor.name == cls.name) {
            // remove own dom node
            root.dom.removeChild(child.dom)
            // get defined props, eventhandlers, ... and apply to new child
            let newChild = new cls(child.cArgs)
            root.dom.appendChild(newChild.dom)
            root.children[id] = newChild
        } else {
            recursiveCheckClass(child, cls)
        }
    }
}

class Reloader {
    constructor(cmpRoot) {
        this.cmpRoot = cmpRoot
    }
    initMessageHandlers() {
        messager.registerMessageHandler('Reloader:fileReloaded', (cmp) => {
            console.log(cmp)
            if (!cmp.startsWith('template')) {
                location.reload()
                return
            }
            import('/' + cmp).then((mdl) => {
                // cls is the class of the replaced template
                let cls = mdl.default
                recursiveCheckClass(this.cmpRoot, cls)
            });
        })
    }
}

export default Reloader
