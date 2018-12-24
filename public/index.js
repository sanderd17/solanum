import MainWindow from "./templates/MainWindow.js"
import ts from "./lib/TagSet.js"
import messager from "./lib/Messager.js"
ts.initMessageHandlers()

const mainWindow = new MainWindow(null, 'mw', false, {})
mainWindow.createSubTemplates()

mainWindow.forEachChild(child => {
    let childDom = child.render()
    childDom.documentElement.setAttribute('id', '--' + child.id)
    document.getElementById('childSvgs').appendChild(childDom.documentElement)
}, true)

const svgDom = mainWindow.render().documentElement
svgDom.setAttribute("width", window.innerWidth)
svgDom.setAttribute("height", window.innerHeight)

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
window['ts'] = ts
// @ts-ignore
window['messager'] = messager
// @ts-ignore
window['mainWindow'] = mainWindow