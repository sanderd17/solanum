import ts from "/lib/TagSet.js"
import messager from "/lib/Messager.js"
import StudioWindow from '/templates/studio/StudioWindow.js'

ts.initMessageHandlers()

let sc = new StudioWindow({
    position: {left:0, right:0, top:0, bottom:0},
    props: {},
    eventHandlers: {}
})

let div = document.getElementById("root")
div.style.width = window.innerWidth + 'px'
div.style.height = window.innerHeight + 'px'
div.appendChild(sc.__dom)

messager.connectToServer(location.host)
window['ts'] = ts
window['StudioWindow'] = sc