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
            // TODO coordinates here is ugly. They come from svg modifiable by editor, so should be applied directly in the svg part of the component
            props: {
                img: '../editor/svgedit/images/select.png', 
            }
        },
        "rect": {
            type: Button,
            props: {
                img: '../editor/svgedit/images/rect.png', 
            }
        },
        "circle": {
            type: Button,
            props: {
                img: '../editor/svgedit/images/circle.png', 
            }
        },
        "ellipse": {
            type: Button,
            props: {
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
    return this.svg`<svg class="editorMode" viewBox="0 0 50 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g class="layer">
            <title>EditorMode</title>
            <use id="select" x="0" y="0" width="50" height="50"/>
            <use id="rect" x="0" y="60" width="100" height="50"/>
            <use id="circle" x="0" y="120" width="50" height="50"/>
            <use id="ellipse" x="0.9090908765792847" y="214.54545211791992" width="50" height="100"/>
        </g>
    </svg>`;
}

export default EditorMode
