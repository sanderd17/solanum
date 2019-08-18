import Template from "/lib/template.js"

class ProjectBrowser extends Template {
    static styles = [
        {
            declarations: {
                'overflow': 'scroll'
            }
        }
    ]
    constructor(...args) {
        super(...args)
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
                    ev.dataTransfer.setData('newComponent', cmp)
                    ev.dataTransfer.setData('module', mod)
                    this.draggedComponent = cmp
                })

                ulModule.appendChild(liCmp)
            }
        }
        // FIXME should not edit dom directly; will not work on reloads
        // FIXME should use a "treeview" component instead of rendering itself
        this.__dom.appendChild(ulMain)
    }

    openComponent(mod, cmp) {
        this.__parent.openComponent(mod, cmp)
    }
}

export default ProjectBrowser