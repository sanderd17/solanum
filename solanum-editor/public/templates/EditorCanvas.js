import Template from '../lib/template.js'
import SvgCanvas from '../editor/svgedit/svgcanvas.js'
//import {InsertElementCommand} from '../editor/svgedit/history.js'

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
        'dragover': (cmp, ev) => ev.preventDefault(),
        'drop': async (cmp, ev) => {
            ev.preventDefault()
            let moduleName = ev.dataTransfer.getData('module')
            let componentName = ev.dataTransfer.getData('component')
            console.log(moduleName + ' ' + componentName)
            // DETERMINE NEW ID
            let i = 1
            let id = 'id-' + componentName + "_" + i
            console.log(cmp.getElementById(id))
            while (document.getElementById(id) != null)
                id = 'id-' + componentName + "_" + (++i)

            // ADD CHILD TO DOM
            const moduleFile = await import('/templates/' + componentName + '.js')
            /** @type {typeof Template} */
            const cmpClass = moduleFile.default
            // TODO find a better string than id, but svgedit breaks on special characters in use referals
            const child = new cmpClass(null, 'id', true, {})

            let childDom = child.render()
            childDom.documentElement.setAttribute('id', '--' + id)
            document.getElementById('childSvgs').appendChild(childDom.documentElement)


            // ADD USE TO SVG
            let canvasRect = cmp.getElementById('canvasRoot').getBoundingClientRect()
            console.log(ev.clientX, ev.clientY, ev.screenX, ev.screenY)
            let el = window.canvas.addSVGElementFromJson({
                element: 'use',
                curStyles: true,
                attr: {
                    x: ev.clientX - canvasRect.left,
                    y: ev.clientY - canvasRect.top,
                    height:100,
                    width:100,
                    id: id,
                    'xlink:href': '#--' + id,
                    opacity: 1
                }
            })

            window.canvas.cleanupElement(el);
            window.canvas.selectOnly([el], true);
            // TODO create the insert command that is stored on the stack
            // undo means to call cmd.unapply(), redo means to call cmd.apply()
            //window.canvas.addCommandToHistory(new InsertElementCommand(el));

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
