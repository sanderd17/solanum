import Button from '/templates/forms/Button.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class ToggleButton extends Button {

    

    constructor(...args) {
        super(...args)
        this.dom.addEventListener('click', () => this.selected = !this.selected)
    }

    selected = false
}

export default ToggleButton