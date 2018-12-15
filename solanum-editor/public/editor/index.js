import MainWindow from "../templates/EditorWindow.js"
import messager from "../lib/Messager.js"

const mainWindow = new MainWindow(null, 'EditorWindow', false, {x:0, y:0, width: 50, height: 500})
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

mainWindow.addBindings()
mainWindow.addEventHandlers()

messager.connectToServer(location.host)
// expose singletons for debugging purposes (via browser console)
// @ts-ignore
window['messager'] = messager
// @ts-ignore
window['mainWindow'] = mainWindow