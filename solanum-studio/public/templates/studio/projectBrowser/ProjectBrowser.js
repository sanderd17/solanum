import Template from "/lib/template.js"
import P from '/lib/Prop.js'

class ProjectBrowser extends Template {
    constructor(...args) {
        super(...args)
        this.setChildren(this.childDefinitions)
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

                liCmp.setAttribute('draggable', 'true')

                //liCmp.addEventListener('click', (ev) => this.selectComponent(cmp))
                liCmp.addEventListener('dblclick', (ev) => this.openComponent(mod, cmp))
                liCmp.addEventListener('dragstart', (ev) => {
                    this.draggedComponent = cmp
                })
                liCmp.addEventListener('dragend', (ev) => this.addComponent(this.draggedComponent)),

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

    addComponent(cmp) {
        // TODO implement adding a new component
        console.log(`add ${cmp}`)
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

            li.ondragstart = (ev) => {
                ev.dataTransfer.setData('module', mod)
                ev.dataTransfer.setData('component', cmp)
            } 

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