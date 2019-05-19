import messager from './Messager.js'

function recursiveCheckClass(root, cls) {
    for (let id in root.children) {
        let child = root.children[id]
        if (child.constructor == cls) {
            // remove own dom node
            root.dom.removeChild(child.dom)
            // get defined props, eventhandlers, ... and apply to new child
            let newChild = new cls(child.cArgs)
            newChild.setParent(root)
            root.dom.appendChild(newChild.dom)
            newChild.classList.add(id)
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
                if (cls == this.cmpRoot.constructor) {
                    location.reload()
                    return
                }
                recursiveCheckClass(this.cmpRoot, cls)
            });
        })
    }
}

export default Reloader
