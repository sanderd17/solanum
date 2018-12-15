import MainWindow from "./templates/MainWindow.js"
import ts from "./lib/TagSet.js"
import messager from "./lib/Messager.js"
ts.initMessageHandlers()

const mainWindow = new MainWindow(null, 'MainWindow', false, {x:0, y:0, width: window.innerWidth, height: window.innerHeight})
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
window['ts'] = ts
// @ts-ignore
window['messager'] = messager
// @ts-ignore
window['mainWindow'] = mainWindow