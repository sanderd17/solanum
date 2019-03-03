import Template from '../lib/template.js'

/** @typedef {import('../lib/template.js').eventHandler} eventHandler */

class EditorTemplateList extends Template {}

EditorTemplateList.prototype.class = 'editortemplatelist'
EditorTemplateList.prototype.size = [50,500]
EditorTemplateList.prototype.css = []

EditorTemplateList.prototype.getReplacements = function() {
    /** @type {Object<string,TemplateDescription>} */
    let repl = {
    }
    return repl
}

EditorTemplateList.prototype.SetComponentList = function(modules){
    const ul = this.getElementById('componentList')
    for (let mod in modules) {
        let li = document.createElement('li')
        li.textContent = mod
        ul.appendChild(li)
        let components = modules[mod]
        let childUl = document.createElement('ul')
        for (let cmp of components) {
            cmp = cmp.split('.')[0]
            let li = document.createElement('li')
            li.textContent = cmp

            li.setAttribute('draggable', true)
            li.ondragstart = (ev) => {
                ev.dataTransfer.setData('module', mod)
                ev.dataTransfer.setData('component', cmp)
            } 

            li.onclick = async () => {
                window.currentModule = mod
                window.currentComponent = cmp
                const module = await import('/templates/' + cmp + '.js')
                /** @type {typeof Template} */
                const cmpClass = module.default
                // TODO find a better string than id, but svgedit breaks on special characters in use referals
                const inst = new cmpClass(null, 'id', true, {})
                inst.createSubTemplates()
                const parser = new DOMParser()

                inst.forEachChild(child => {
                    let childDom = child.render()
                    childDom.documentElement.setAttribute('id', '--' + child.id)
                    document.getElementById('childSvgs').appendChild(childDom.documentElement)
                }, true)
                const svgDom = inst.render()
                //svgDom.setAttribute('version', '1.1')
                //svgDom.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
                //svgDom.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
                const viewBox = svgDom.documentElement.getAttribute('viewBox')
                const [_1, _2, w, h] = viewBox.split(' ')
                window.currentSize = [w, h]
                window.currentClass = svgDom.documentElement.getAttribute('class')
                const XmlS = new XMLSerializer()
                setTimeout(() => canvas.setSvgString(XmlS.serializeToString(svgDom), false), 0)
                canvas.setResolution(w, h)
                canvas.updateCanvas(w, h)
            }
            childUl.appendChild(li)
        }
        ul.appendChild(childUl)
    }
}

EditorTemplateList.prototype.eventHandlers = {
    "": {
        load: (cmp, ev) => {
            fetch('../API/Editor/getComponentPaths', {cache: 'reload'})
            .then(async response => {
                const modules = await response.json()
                cmp.SetComponentList(modules)
            })
        }
    },
}

EditorTemplateList.prototype.domBindings = {}

EditorTemplateList.prototype.render = function() {
    return this.svg`<svg class="editorMode" viewBox="0 0 300 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g class="layer">
            <title>EditorTemplateList</title>
        <foreignObject x="0" y="0" width="300" height="500">
            <div
                id="canvasRoot"
                xmlns="http://www.w3.org/1999/xhtml"
                style="max-width:300px; max-height:500px; overflow:auto; white-space:nowrap;">
                <ul id="componentList">
                </ul>
            </div>
            </foreignObject>
        </g>
    </svg>`;
}

export default EditorTemplateList
