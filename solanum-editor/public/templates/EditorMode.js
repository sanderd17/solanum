import Template from '../lib/template.js'
import Button from './forms/button.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class EditorMode extends Template {}

EditorMode.prototype.class = 'editormode'
EditorMode.prototype.size = [50,500]
EditorMode.prototype.css = [
    `.editormode > rect:hover {
        cursor: pointer;
    }`,
]

EditorMode.prototype.getReplacements = function() {
    /** @type {Object<string,TemplateDescription>} */
    let repl = {
        "select": {
            type: Button,
            props: {x: 0, y: 0, width: 50, height: 50,
                img: '../editor/svgedit/images/select.png', 
            }
        },
        "rect": {
            type: Button,
            props: {x: 0, y: 60, width: 50, height: 50,
                img: '../editor/svgedit/images/rect.png', 
            }
        },
        "circle": {
            type: Button,
            props: {x: 0, y: 120, width: 50, height: 50,
                img: '../editor/svgedit/images/circle.png', 
            }
        },
        "ellipse": {
            type: Button,
            props: {x: 0, y: 180, width: 50, height: 50,
                img: '../editor/svgedit/images/ellipse.png', 
            }
        },
    }
    return repl
}

EditorMode.prototype.eventHandlers = {
    select: {click:  () => {window.canvas.setMode('select')}},
    rect: {click:  () => {window.canvas.setMode('rect')}},
    circle: {click:  () => {window.canvas.setMode('circle')}},
    ellipse: {click:  () => {window.canvas.setMode('ellipse')}},
}

EditorMode.prototype.domBindings = {}

EditorMode.prototype.render = function() {
    return this.svg`<title>EditorMode</title>
        ${this.children.select.render()}
        ${this.children.rect.render()}
        ${this.children.circle.render()}
        ${this.children.ellipse.render()}
    `;
}

export default EditorMode
