import ts from "/lib/TagSet.js"
import messager from "/lib/Messager.js"
import TagWindow from '/templates/studio/TagWindow.js'

ts.initMessageHandlers()

let tw = new TagWindow({
    position: {left:0, right:0, top:0, bottom:0},
    props: {},
    eventHandlers: {}
})

let div = document.getElementById("root")
div.style.width = window.innerWidth + 'px'
div.style.height = window.innerHeight + 'px'
div.appendChild(tw.dom)

messager.connectToServer(location.host)
window['ts'] = ts
window['TagWindow'] = tw