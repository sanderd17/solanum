// import whatever gui template/screens needed
import Template from "../lib/template.js"
import EditorMode from './EditorMode.js'
import EditorCanvas from './EditorCanvas.js'
import EditorAttributes from "./EditorAttributes.js";

/**  @typedef {import('../lib/template.js').TemplateDescription} TemplateDescription */
class EditorWindow extends Template {}

EditorWindow.prototype.class = 'window EditorWindow'
EditorWindow.prototype.size = [50,500]

EditorWindow.prototype.getReplacements = function() {
    /** @type {Object<string,TemplateDescription>} */
    let repl = {
        "editorMode": {
            type: EditorMode,
            props: {}
        },
        "editorCanvas": {
            type: EditorCanvas,
            props: {}
        },
        "editorAttributes": {
            type: EditorAttributes,
            props: {}
        },
    }
    return repl
}

EditorWindow.prototype.render = function() {
    return this.svg`<svg class="editorMode" viewBox="0 0 1200 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g class="layer">
            <title>notitle</title>
            <use id="editorMode" x="0.8181819915771484" y="10.18181824684143" width="50" height="500"/>
            <use id="editorCanvas" x="50" y="0" width="1000" height="500"/>
            <use id="editorAttributes" x="1050" y="0" width="150" height="500"/>
        </g>
    </svg>`;
}

export default EditorWindow
