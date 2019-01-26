import Template from '../lib/template.js'
import Button from './forms/button.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class EditorAttributes extends Template {}

EditorAttributes.prototype.class = 'editormode'
EditorAttributes.prototype.size = [50,500]
EditorAttributes.prototype.css = [
    `.editormode > rect:hover {
        cursor: pointer;
    }`,
]

EditorAttributes.prototype.getReplacements = function() {
    /** @type {Object<string,TemplateDescription>} */
    let repl = {
    }
    return repl
}

EditorAttributes.prototype.eventHandlers = {
    fill: {
        input: (cmp, ev) => canvas.getSelectedElems()
            .forEach(el => el.setAttribute('fill', ev.target.value))
    },
    stroke: {
        input: (cmp, ev) => canvas.getSelectedElems()
            .forEach(el => el.setAttribute('stroke', ev.target.value))
    }
}

EditorAttributes.prototype.domBindings = {}

EditorAttributes.prototype.render = function() {
    return this.svg`<svg class="editorMode" viewBox="0 0 300 300" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g class="layer">
            <title>EditorAttributes</title>
        <foreignObject x="0" y="0" width="300" height="300">
            <div
                id="canvasRoot"
                xmlns="http://www.w3.org/1999/xhtml"
                style="max-width:150px; max-height:500px; overflow:auto; white-space:nowrap;">
                Fill: 
                <input type="color" id="fill" value="#FF0000">
                </input> <br/>
                Stroke: 
                <input type="color" id="stroke" value="#FF0000">
                </input> <br/>
            </div>
            </foreignObject>
        </g>
    </svg>`;
}

export default EditorAttributes
