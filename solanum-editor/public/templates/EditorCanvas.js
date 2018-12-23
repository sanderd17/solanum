import Template from '../lib/template.js'
import SvgCanvas from '../editor/svgedit/svgcanvas.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class EditorMode extends Template {}

EditorMode.prototype.class = 'editormode'
EditorMode.prototype.size = [50,500]
EditorMode.prototype.css = [
    `.editormode > rect:hover {
        cursor: pointer;
    }`,
]

EditorMode.prototype.getReplacements = function() {return {}}

EditorMode.prototype.eventHandlers = {}

EditorMode.prototype.domBindings = {}

EditorMode.prototype.render = function() {
    return this.svg`<svg class="editorCanvas" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    </svg>
`;
}

export default EditorMode
