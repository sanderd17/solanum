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
            props: {
                x: 0,
                y: 0,
                width: 50,
                height: 500,
            }
        }
    }
    return repl
}

EditorWindow.prototype.render = function() {
    console.log(this.children)
    return this.svg`${this.children.editorMode.render()}`
}

export default EditorWindow
