import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import StudioCanvas from '/templates/studio/canvas/StudioCanvas.js'
import ProjectBrowser from '/templates/studio/projectBrowser/ProjectBrowser.js'
import TagBrowser from '/templates/studio/tagBrowser/TagBrowser.js'
import PropEditor from '/templates/studio/propEditor/PropEditor.js'
import LayoutBar from "/templates/studio/menuBars/LayoutBar.js"
import CodeEditor from '/templates/studio/codeEditor/Editor.js'

import {getChildAst} from '/lib/AstNavigator.js'

class StudioWindow extends Template {
    constructor(...args) {
        super(...args)
        this.init()
        this.cnt = 1
    }

    properties = {
        moduleName: new Prop('null'),
        componentName: new Prop('null'),
        componentClass: new Prop('null'),
        componentInstance: new Prop('null'),
        componentCode: new Prop('""'),
        componentAST: new Prop('null'),

        cmpSelection: new Prop('{}', (newSelection) => {
            if (!newSelection)
                return

            if (Object.keys(newSelection).length == 1) {
                let ast = this.properties.componentAST.value
                let childId = Object.keys(newSelection)[0]
                let childKeyLoc = getChildAst(ast, childId).key.loc
                console.log(childKeyLoc)

                this.children.codeEditor.highlightLoc(childKeyLoc)
            }
        })
    }

    children = {
        layoutBar: new LayoutBar({
            parent: this,
            position: {left: '0px', top:'0px', width: '100%', height: '20px'},
            properties: {
                positionUnit: '"px"'
            },
            eventHandlers: {}
        }),
        canvas: new StudioCanvas({
            parent: this,
            position: {left: "300px", right: "300px", top: "20px", bottom: "0px"},
            properties: {
                cmpSelection: "Prop('cmpSelection')",
            },
            eventHandlers: {
                click: (ev) => {
                    // click in the grey area, remove selection
                    this.children.propEditor.properties.cmpSelection.value = []
                    this.children.canvas.children.interaction.properties.selection.value = []
                },
                selectionchanged: (ev) => {
                    let cmpSelection = {}
                    for (let id of ev.detail.selection) {
                        cmpSelection[id] = this.children.canvas.children.preview.children[id]
                    }
                    this.properties.cmpSelection.value = cmpSelection
                },
                childpositionchanged: async (ev) => {
                    if (ev.detail.previewOnly)
                        return // don't update the server for only a preview
                    this.children.propEditor.recalcPositionParameters()
                    let newCode = await this.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                    this.setCode(newCode)
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                },
                droppedchild: async (ev) => {
                    let newCode = await this.callStudioApi('addChildComponent', {
                        childId: ev.detail.childId,
                        childClassName: ev.detail.childClassName, 
                        childPath: ev.detail.childPath,
                        position: ev.detail.position,
                    })
                    this.setCode(newCode)
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                },
                deletedchildren: async (ev, root) => {
                    let newCode = await root.callStudioApi('removeChildComponents', {childIds: ev.detail.childIds})
                },
            },
        }),
        projectBrowser: new ProjectBrowser({
            parent: this,
            position: {left: "0px", width: "300px", top: "20px", bottom: "50%"},
            properties: {},
            eventHandlers: {},
        }),
        tagBrowser: new TagBrowser({
            parent: this,
            position: {left: "0px", width: "300px", bottom: "0px", height: "50%"},
            properties: {},
            eventHandlers: {},
        }),
        propEditor: new PropEditor({
            parent: this,
            position: {right: "0px", width: "300px", top: "20px", bottom: "0px"},
            properties: {
                module: "Prop('moduleName')",
                component: "Prop('componentName')",
                cmpSelection: "Prop('cmpSelection')",
            },
            eventHandlers: {
                positionpropchanged: async (ev, root) => {
                    root.children.canvas.setChildPosition(ev.detail.childId, ev.detail.newPosition)
                    let newCode = await root.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                    root.setCode(newCode)
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                },
                childPropChanged: async (ev, root) => {
                    let newCode = await root.callStudioApi('setChildProp', {
                        childId: ev.detail.childId,
                        propName: ev.detail.propName,
                        value: ev.detail.newValue,
                    })
                    root.setCode(newCode)
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                },
            },
        }),
        codeEditor: new CodeEditor({
            parent: this,
            position: {left: '300px', right: '300px', height: '300px', bottom: '0px'},
            properties: {},
            eventHandlers: {
                codeContentChanged: async (ev, root) => {
                    let newCode = await root.callStudioApi('setComponentCode', {
                        oldCode: ev.detail.oldCode,
                        newCode: ev.detail.newCode,
                    })
                    root.children.canvas.setComponent(root.mod, root.cmp)
                    root.children.propEditor.cmpSelection = []
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                }
            },
        }),
    }

    positionUnit = 'px'

    async openComponent(moduleName, componentName) {
        this.properties.moduleName.value = moduleName
        this.properties.componentName.value = componentName

        this.cnt++
        let mdl = await import(`/API/Studio/openComponent?module=${moduleName}&component=${componentName}&v=${this.cnt}`)

        // cls is the class of the template that we'er going to edit
        this.properties.componentClass.value = mdl.default
        this.properties.componentInstance.value = this.children.canvas.setComponent(this.properties.componentClass.value)
        
        let response = await fetch(`/API/Studio/openComponent?module=${moduleName}&component=${componentName}`, { cache: "no-cache" })
        let code = await response.text()
        // TODO turn into valid property, and pass as property binding
        this.children.codeEditor.code = code
        this.properties.componentCode.value = code

        let ast = await this.callStudioApi('getComponentAST', {'module': moduleName, 'component': componentName})
        this.properties.componentAST.value = JSON.parse(ast)
        console.log(this.properties.componentAST.value)
    }

    setCode(newCode) {
        this.children.codeEditor.code = newCode
    }

    /**
     * Call an api function on the studio API
     * @param {string} apiFunction  function name of the Studio API
     * @param  {object} args any additional arguments to send to the body
     */
    async callStudioApi(apiFunction, args) {
        let body = {
            module: this.properties.moduleName.value,
            component: this.properties.componentName.value,
            ...args
        }
        let result = await fetch(`/API/studio/${apiFunction}`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'same-origin', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(body), // body data type must match "Content-Type" header
        })
        return await result.text()
    }
}

export default StudioWindow