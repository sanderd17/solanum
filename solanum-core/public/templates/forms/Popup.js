import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Popup extends Template {
    static defaultSize = [200, 300]

    async setTemplate(templatePath, props) {
        const mdl = await import(`/templates/${templatePath}.js`)
        const cls = mdl.default

        const outerDiv = this.__dom
        let [width, height] = cls.defaultSize
        outerDiv.style.width = width + 'px'
        outerDiv.style.height = (height + 15) + 'px'

        // add template to inner div
        const template = new cls({
            parent: this,
            position: {left: '0px', top: '15px', right: '0px', bottom: '0px'},
            props,
            eventHandlers: {},
        })

        const innerDiv = template.__dom
        outerDiv.appendChild(innerDiv)
    }

    createDomNode() {
        if (this.__dom) {
            return
        }
        this.__dom = document.createElement('div')

        this.currentPos = [100, 100] // TODO depend on current pos

        this.classList.add(this.__className)
        this.classList.add('solanum')

        // create floating outer div
        this.__dom.style.border = '2px solid darkgrey' // TODO make configuable
        this.__dom.style.top = this.currentPos[0] + 'px'
        this.__dom.style.left = this.currentPos[1] + 'px'
        //this.__dom.style.transition = 'all .01s'

        this.__dom.style.backgroundColor = 'white' // TODO make configurable

        
        // Make draggable title bar (extra argument?)
        const titleBar = document.createElement('div')
        titleBar.style.top = '0'
        titleBar.style.left = '0'
        titleBar.style.width = '100%'
        titleBar.style.height = '15px'
        titleBar.style.backgroundColor = 'darkgrey'
        titleBar.style.color = 'white'
        titleBar.style.position = 'absolute'
        // popup draggin
        titleBar.setAttribute('draggable', true)
        titleBar.addEventListener('dragstart', (ev) => {
            ev.stopPropagation
            this.startDragTitleBar(ev)
        })
        titleBar.addEventListener('drag', (ev) => {
            ev.stopPropagation
            this.dragTitleBar(ev)
        })
        this.__dom.appendChild(titleBar)

        // close button
        const closeButton = document.createElement('div')
        closeButton.innerHTML = '&times;'
        closeButton.style.height = '13px'
        closeButton.style.width = '13px'
        closeButton.style.lineHeight = '13px'
        closeButton.style.top = '0px'
        closeButton.style.right = '0px'
        closeButton.style.color = 'lightgray'
        closeButton.style.position = 'absolute'
        closeButton.style.cursor = 'pointer'
        closeButton.addEventListener('click', (ev) => this.destroy())
        titleBar.appendChild(closeButton)

        document.body.appendChild(this.__dom)

        this.setTemplate(this.__cArgs.props.templatePath, this.__cArgs.props.props)
    }

    /**
     * 
     * @param {DragEvent} ev 
     */
    startDragTitleBar(ev) {
        this.positionDiff = [
            this.currentPos[0] - ev.x,
            this.currentPos[1] - ev.y
        ]
    }

    /**
     * @param {DragEvent} ev 
     */
    dragTitleBar(ev) {
        if (ev.x ==0 || ev.y == 0)
            return
        this.currentPos = [this.positionDiff[0] + ev.x, this.positionDiff[0] + ev.y]
        console.log(ev)
        this.__dom.style.left = (this.positionDiff[0] + ev.x) + 'px'
        this.__dom.style.top = (this.positionDiff[1] + ev.y) + 'px'
    }
}

export default Popup