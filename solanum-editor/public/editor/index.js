import EditorWindow from "../templates/EditorWindow.js"
import messager from "../lib/Messager.js"

const mainWindow = new EditorWindow(null, 'EditorWindow', false, {})
mainWindow.createSubTemplates()

const svgDom = mainWindow.render().documentElement
svgDom.setAttribute("width", 1050)
svgDom.setAttribute("height", 500)

const replaceUses = function(dom, cmp) {
    for (let el of dom.querySelectorAll('use')) {
        let id = el.id.split('-').pop()
        let child = cmp.children[id]
        if (!child) {
            console.log(`Child ${id} not found`)
            continue
        }

        let childDom = child.render().documentElement

        childDom.setAttribute("x", el.getAttribute("x"))
        childDom.setAttribute("y", el.getAttribute("y"))
        childDom.setAttribute("width", el.getAttribute("width"))
        childDom.setAttribute("height", el.getAttribute("height"))

        el.replaceWith(childDom)
        replaceUses(childDom, child)
    }
}

replaceUses(svgDom, mainWindow)
/*
mainWindow.forEachChild(child => {
    let childDom = child.render()
    childDom.documentElement.setAttribute('id', '--' + child.id)
    document.getElementById('childSvgs').appendChild(childDom.documentElement)
}, true)
*/

let div = document.getElementById("root")
div.appendChild(svgDom)

let styleEl = document.createElement('style')
document.head.appendChild(styleEl)
let rules = ''
for (let rule of Object.values(mainWindow.getCssMap())) {
    rules += rule + ' \n'
}
styleEl.innerHTML = rules

mainWindow.addBindings()
mainWindow.addEventHandlers()

messager.connectToServer(location.host)
// expose singletons for debugging purposes (via browser console)
// @ts-ignore
window['messager'] = messager
// @ts-ignore
window['mainWindow'] = mainWindow