import Template from "/lib/template.js"
import P from '/lib/Prop.js'

class ProjectBrowser extends Template {
    init() {
        this.setChildren({ })

        this.loadComponents()
    }

    async loadComponents() {
        let response = await fetch('/API/studio/getComponentPaths', {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'same-origin', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
        })

        let modules = await response.json()

        console.log(modules)

        let ulMain = document.createElement('ul')
        for (let mod in modules) {
            let liModule = document.createElement('li')
            liModule.textContent = mod
            let ulModule = document.createElement('ul')
            liModule.appendChild(ulModule)
            ulMain.appendChild(liModule)

            let components = modules[mod]
            for (let cmp of components) {
                let liCmp = document.createElement('li')
                liCmp.textContent = cmp

                //liCmp.addEventListener('click', (ev) => this.selectComponent(cmp))
                liCmp.addEventListener('dblclick', (ev) => this.openComponent(mod, cmp))

                ulModule.appendChild(liCmp)
            }
        }
        // FIXME should not edit dom directly; will not work on reloads
        // FIXME should use a "treeview" component instead of rendering itself
        this.dom.appendChild(ulMain)
    }

    openComponent(mod, cmp) {
        this.parent.openComponent(mod, cmp)
    }
}

ProjectBrowser.prototype.css = {
}

export default ProjectBrowser


// Old template list for reference
/*
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
        load: async(cmp, ev) => {
            const response = await fetch('../API/Editor/getComponentPaths', {cache: 'reload'})
            const modules = await response.json()
            cmp.SetComponentList(modules)
        }
    },
}
*/