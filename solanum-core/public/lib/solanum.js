
import Popup from '/templates/forms/Popup.js'

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

export default solanum