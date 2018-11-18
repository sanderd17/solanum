import MainWindow from "./templates/MainWindow.js"
import ts from "./lib/TagSet.js"
import messager from "./lib/Messager.js"
ts.initMessageHandlers()

const mainWindow = new MainWindow(null, 'MainWindow', {x:0, y:0, width: window.innerWidth, height: window.innerHeight})
mainWindow.createSubTemplates()
let div = document.querySelector("#root")
div.innerHTML = mainWindow.render()

let styleEl = document.createElement('style')
document.head.appendChild(styleEl)
let rules = ''
for (let rule of Object.values(mainWindow.getCssMap())) {
    rules += rule + ' \n'
}
styleEl.innerHTML = rules

mainWindow.addDataBindings()
mainWindow.addTagBindings()
mainWindow.addEventHandlers()

messager.connectToServer(location.host)
// expose singletons for debugging purposes (via browser console)
window['ts'] = ts
window['messager'] = messager
window['mainWindow'] = mainWindow