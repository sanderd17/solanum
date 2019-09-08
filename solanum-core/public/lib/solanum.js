
const solanum = {}

/**
 * 
 * @param {string} templatePath 
 * @param {object} props 
 */
solanum.openPopup = async function(templatePath, props) {
    /*
        TODO: test this code
    */
    const mdl = await import(`/templates/${templatePath}.js`)
    const cls = mdl.default

    // create floating outer div
    const outerDiv = document.createElement('div')
    outerDiv.style.border = '2px solid darkgrey'
    outerDiv.style.top = '100px'
    outerDiv.style.left = '100px'
    outerDiv.style.position = 'absolute'
    let [width, height] = cls.defaultSize
    outerDiv.style.width = width + 'px'
    outerDiv.style.height = (height + 15) + 'px'

    outerDiv.style.backgroundColor = 'white'

    
    // Make draggable title bar (extra argument?)
    const titleBar = document.createElement('div')
    titleBar.style.top = '0'
    titleBar.style.left = '0'
    titleBar.style.width = '100%'
    titleBar.style.height = '15px'
    titleBar.style.backgroundColor = 'darkgrey'
    titleBar.style.color = 'white'
    titleBar.style.position = 'absolute'
    outerDiv.appendChild(titleBar)
    
    // add template to inner div
    const template = new cls({
        parent: null,
        position: {left: '0px', top: '15px', right: '0px', bottom: '0px'},
        props,
        eventHandlers: {},
    })

    const innerDiv = template.__dom
    outerDiv.appendChild(innerDiv)

    document.body.appendChild(outerDiv)

    console.log(outerDiv)

}

export default solanum