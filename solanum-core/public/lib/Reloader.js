import messager from './Messager.js'
import style from '/lib/Styling.js'

function recursiveCheckClass(root, cls) {
    for (let id in root.children) {
        let child = root.children[id]
        if (child.constructor.name == cls.name) {
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
        this.cnt = 1
    }
    initMessageHandlers() {
        messager.registerMessageHandler('Reloader:fileReloaded', (cmp) => {
            console.log(cmp)
            if (!cmp.startsWith('template')) {
                location.reload()
                return
            }
            import('/' + cmp + '?v=' + this.cnt).then((mdl) => {
                this.cnt++
                // cls is the class of the replaced template
                let cls = mdl.default
                if (cls.name == this.cmpRoot.constructor.name) {
                    location.reload()
                    return
                }
                recursiveCheckClass(this.cmpRoot, cls)
                style.reloadClassStyle(cls)
                console.log(cls.prototype.css)
            });
        })
    }
}

export default Reloader
