import ts from "/lib/TagSet.js"
import StudioWindow from '/templates/StudioWindow.js'
ts.initMessageHandlers()

let sc = new StudioWindow({
    position: {left:0, right:0, top:0, bottom:0},
    props: {},
    eventHandlers: {}
})

sc.setId('studioWindow')

let div = document.getElementById("root")
div.style.width = window.innerWidth + 'px'
div.style.height = window.innerHeight + 'px'
div.appendChild(sc.dom)