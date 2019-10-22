import Template from '/lib/template.js'

const positionKeys = ['left', 'right', 'top', 'bottom', 'width', 'height']

class Icon extends Template {

    _iconSet = ''
    get iconSet() {
        return this._iconSet
    }

    set iconSet(iconSet) {
        this._iconSet = iconSet
        if (this.iconPath != '') {
            this.__dom.setAttribute("src", `/icons?iconSet=${encodeURIComponent(this.iconSet)}&iconPath=${encodeURIComponent(this.iconPath)}`)
        }
    }

    _iconPath = ''
    get iconPath() {
        return this._iconPath
    }

    set iconPath(iconPath) {
        this._iconPath = iconPath
        if (this.iconSet != '' ) {
            this.__dom.setAttribute("src", `/icons?iconSet=${encodeURIComponent(this.iconSet)}&iconPath=${encodeURIComponent(this.iconPath)}`)
        }
    }

    createDomNode() {
        this.__dom = document.createElement("img")
        this.__dom.setAttribute("preserveAspectRatio", "none")

        this.classList.add('solanum')
        this.classList.add(this.__className)

        for (let key of positionKeys)
            if (key in this.__position) this.__dom.style[key] = this.__position[key]

        if (this.__parent) {
            this.__parent.createDomNode()
            this.__parent.__dom.appendChild(this.__dom)
        }
    }
}

export default Icon