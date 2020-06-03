
import Popup from '/templates/forms/Popup.js'
import ContextMenu from '/templates/forms/ContextMenu.js'

const solanum = {}

/**
 * 
 * @param {string} templatePath 
 * @param {object} properties 
 */
solanum.openPopup = async function(templatePath, properties) {
    const popup = new Popup({
        parent: null,
        properties
    })
    popup.setTemplate(templatePath, properties)
}

/** @type {ContextMenu} */
let activeCtxMenu = null
let documentHandlersInitialised = false
solanum.openContextMenu = async function(event, templatePath, properties) {
    if (activeCtxMenu) {
        solanum.closeContextMenu()
    }

    if (!documentHandlersInitialised) {
        document.body.addEventListener('contextmenu', solanum.closeContextMenu)
        document.body.addEventListener('click', solanum.closeContextMenu)
        documentHandlersInitialised = true
    }

    const ctxMenu = new ContextMenu({
        parent: null,
        properties,
        position: {left: event.clientX + 'px', top: event.clientY + 'px'}
    })
    ctxMenu.setTemplate(templatePath, properties)
    activeCtxMenu = ctxMenu
    event.preventDefault()
    event.stopPropagation()
}

solanum.closeContextMenu = function() {
    if (activeCtxMenu) {
        activeCtxMenu.destroy()
        activeCtxMenu = null
    }
}

export default solanum