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
    }
}

EditorMode.prototype.domBindings = {}

EditorMode.prototype.render = function() {
    return this.svg`<svg class="editorCanvas" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <foreignObject x="0" y="0" width="1000" height="500">
            <div
                id="canvasRoot"
                xmlns="http://www.w3.org/1999/xhtml"
                style="max-width:950px; max-height:450px; overflow:auto; white-space:nowrap;">
            </div>
        </foreignObject>
    </svg>
`;
}

export default EditorMode
