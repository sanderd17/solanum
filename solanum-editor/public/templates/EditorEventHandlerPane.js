import Template from '../lib/template.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class EditorEventHandlerPane extends Template {}

EditorEventHandlerPane.prototype.class = 'editorScriptPane'
EditorEventHandlerPane.prototype.size = [600,500]
EditorEventHandlerPane.prototype.css = []

EditorEventHandlerPane.prototype.getReplacements = function() {
    /** @type {Object<string,EditorEventHandlerPane>} */
    let repl = {
    }
    return repl
}

EditorEventHandlerPane.prototype.setupScriptPane = function() {
    // TODO find a nicer way to load this editor
    // TODO get selected object stuff and set script
    require.config({ paths: { 'vs': '/editor/monaco/min/vs' }})
    require(['vs/editor/editor.main'], () => {
        var editor = monaco.editor.create(this.getElementById('scriptPane'), {
            value: [
                'function x() {',
                '\tconsole.log("Hello world!");',
                '}'
            ].join('\n'),
            language: 'javascript'
        })
    })
}

EditorEventHandlerPane.prototype.eventHandlers = {
    "": {
        load: (cmp, ev) => {
            cmp.setupScriptPane()
        }
    },
}

EditorEventHandlerPane.prototype.domBindings = {}

EditorEventHandlerPane.prototype.render = function() {
    return this.svg`<svg viewBox="0 0 500 500" version="2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g class="layer">
            <title>EditorTemplateList</title>
        <foreignObject x="0" y="0" width="500" height="500" style="overflow:visible">
            <div
                id="scriptPane"
                xmlns="http://www.w3.org/1999/xhtml"
                style="position:absolute;left:0px;top:0px;width:500px; height:500px;">
            </div>
    <!--<video controls="" style="width:600px; height:500px; position:fixed;">>
        <source src="https://interactive-examples.mdn.mozilla.net/media/examples/flower.webm"
                type="video/webm"/>
    </video>-->

            </foreignObject>
        </g>
    </svg>`;
}

export default EditorEventHandlerPane
