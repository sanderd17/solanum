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

EditorMode.prototype.eventHandlers = {
    '': {
        load: (cmp) => {
            const container = cmp.getElementById('canvasRoot')
            const currentSize = [300, 300]
            const config = {
                initFill: {color: 'FFFFFF', opacity: 1},
                initStroke: {color: '000000', opacity: 1, width: 1},
                text: {stroke_width: 0, font_size: 24, font_family: 'serif'},
                initOpacity: 1,
                imgPath: 'svgedit/images/',
                dimensions: currentSize,
                baseUnit: 'px',
            }
            window.canvas = new SvgCanvas(container, config)
            window.canvas.updateCanvas(...currentSize);
        }
    },
    'canvasRoot': {
        'dragover': (cmp, ev) => {
            console.log("dragging")
            ev.preventDefault()
        },
        'drop': (cmp, ev) => {
            ev.preventDefault()
            let module = ev.dataTransfer.getData('module')
            let component = ev.dataTransfer.getData('component')
            console.log(module + ' ' + component)
            let thisRect = cmp.getElementById('canvasRoot').getBoundingClientRect()
            let i = 1
            let id = 'id.' + component + "-" + i
            console.log(cmp.getElementById(id))
            while (document.getElementById(id) != null)
                id = 'id.' + component + "-" + (++i)
            console.log(ev.clientX, ev.clientY, ev.screenX, ev.screenY)
            let el = window.canvas.addSVGElementFromJson({
                element: 'rect',
                curStyles: true,
                attr: {
                    x: ev.clientX - thisRect.left,
                    y: ev.clientY - thisRect.top,
                    height:100,
                    width:100,
                    id: id,
                    fill: 'black',
                    opacity: 1
                }
            })

            window.canvas.cleanupElement(el);
            window.canvas.selectOnly([el], true);
            // we create the insert command that is stored on the stack
            // undo means to call cmd.unapply(), redo means to call cmd.apply()
            addCommandToHistory(new InsertElementCommand(el));

            window.canvas.call('changed', [el])
        },
    },
}

EditorMode.prototype.domBindings = {}

EditorMode.prototype.render = function() {
    return this.svg`<svg class="editorCanvas" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect fill="grey" width="100%" height="100%"/>
        <foreignObject x="0" y="0" width="1000" height="500">
            <div
                id="canvasRoot"
                xmlns="http://www.w3.org/1999/xhtml"
                style="max-width:1000px; max-height:500px; overflow:auto; white-space:nowrap;">
            </div>
        </foreignObject>
    </svg>
`;
}

export default EditorMode
