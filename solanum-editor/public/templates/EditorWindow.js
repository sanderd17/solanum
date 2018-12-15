// import whatever gui template/screens needed
import Template from "../lib/template.js"
import EditorMode from './EditorMode.js'
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
        }
    }
    return repl
}

EditorWindow.prototype.render = function() {
    return this.svg` 
        <use id="{id}.editorMode" xlink:href="#cmp-{id}.editorMode" x="0" y="0" width="50" height="500"/>`
}

export default EditorWindow
