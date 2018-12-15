import MainWindow from "../templates/EditorWindow.js"
import messager from "../lib/Messager.js"

const mainWindow = new MainWindow(null, 'EditorWindow', false, {x:0, y:0, width: 50, height: 500})
mainWindow.createSubTemplates()
let symbols = document.querySelector("#symbols")
let symbolElements = []
function renderChildren(cmp) {
    symbolElements.push(cmp.render())
    if (cmp.children) {
        for (let c in cmp.children)
            renderChildren(cmp.children[c])
    }
}
renderChildren(mainWindow)
symbols.innerHTML = symbolElements.join('\n')

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