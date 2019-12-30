import MainWindow from "./templates/MainWindow.js"
import ts from "./lib/TagSet.js"
import Reloader from './lib/Reloader.js'
import messager from "./lib/Messager.js"
ts.initMessageHandlers()

let root = document.getElementById('root')
root.style.width = window.innerWidth + 'px'
root.style.height = window.innerHeight + 'px'

const mainWindow = new MainWindow({
    position: {left: '0px', right: '0px', top: '0px', bottom: '0px' }
})
let r = new Reloader(mainWindow)
r.initMessageHandlers()
let div = document.getElementById("root")
div.appendChild(mainWindow.dom)


messager.connectToServer(location.host)
// expose singletons for debugging purposes (via browser console)
// @ts-ignore
window['ts'] = ts
// @ts-ignore
window['messager'] = messager
// @ts-ignore
window['mainWindow'] = mainWindow