
import Popup from '/templates/forms/Popup.js'

const solanum = {}

/**
 * 
 * @param {string} templatePath 
 * @param {object} props 
 */
solanum.openPopup = async function(templatePath, props) {
    const popup = new Popup({
        parent: null,
        props: {
            templatePath,
            props
        }
    })
}

export default solanum