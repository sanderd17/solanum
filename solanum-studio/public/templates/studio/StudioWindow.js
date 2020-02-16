import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import StudioCanvas from '/templates/studio/canvas/StudioCanvas.js'
import ProjectBrowser from '/templates/studio/projectBrowser/ProjectBrowser.js'
import TagBrowser from '/templates/studio/tagBrowser/TagBrowser.js'
import PropEditor from '/templates/studio/propEditor/PropEditor.js'
import LayoutBar from "/templates/studio/menuBars/LayoutBar.js"
import CodeEditor from '/templates/studio/codeEditor/Editor.js'

import messager from '/lib/Messager.js'
import {getChildAst} from '/lib/AstNavigator.js'

class StudioWindow extends Template {
    constructor(args) {
        super(args)
        this.init()
        this.cnt = 1

        // Handling messages coming from the server
        let setChangedCode = (data) => {
            //this.children.codeEditor.code = data.code
            let ast = data.ast
            let code = data.code
            this.prop.componentInfo = {ast, code}
            // TODO also perform the update on the component if this isn't the source client, otherwise the update is already done
        }

        // Register messagges
        messager.registerMessageHandler('studio/setComponentCode', (data) => {
            if (this.prop.moduleName != null && this.prop.componentName != null) {
                // TODO don't refresh the code of the source client, that code is already up-to-date, and people like to follow their cursor
                this.openComponent(this.prop.moduleName, this.prop.componentName)
            }
        })
        messager.registerMessageHandler('studio/setChildPosition', setChangedCode)
        messager.registerMessageHandler('studio/addChildComponent', setChangedCode)
        messager.registerMessageHandler('studio/removeChildComponents', setChangedCode)
        messager.registerMessageHandler('studio/setOwnPropBinding', setChangedCode)
        messager.registerMessageHandler('studio/setChildProp', setChangedCode)

        // Reload component after a reconnect due to a network issue
        messager.registerOnopenHandler(() => {
            if (this.prop.moduleName != null && this.prop.componentName != null) {
                this.openComponent(this.prop.moduleName, this.prop.componentName)
            }
        })
    }

    properties = {
        moduleName: new Prop('null'),
        componentName: new Prop('null'),
        componentClass: new Prop('null'),
        componentInstance: new Prop('null'),
        componentInfo: new Prop('null'),

        cmpSelection: new Prop('{}', (newSelection) => {
            if (!newSelection)
                return

            if (Object.keys(newSelection).length == 1) {
                let ast = this.prop.componentInfo.ast
                let childId = Object.keys(newSelection)[0]
                let childKeyLoc = getChildAst(ast, childId).key.loc
                console.log(childKeyLoc)

                this.children.codeEditor.highlightLoc(childKeyLoc)
            }
        }),
        positionUnit: new Prop("'px'")
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
                positionUnit: "Prop('positionUnit')",
            },
            eventHandlers: {
                click: (ev) => {
                    // click in the grey area, remove selection
                    this.prop.cmpSelection = {}
                },
                selectionchanged: (ev) => {
                    let cmpSelection = {}
                    for (let id of ev.detail.selection) {
                        cmpSelection[id] = this.children.canvas.children.preview.children[id]
                    }
                    this.prop.cmpSelection = cmpSelection
                },
                childpositionchanged: async (ev) => {
                    if (ev.detail.previewOnly)
                        return // don't update the server for only a preview
                    this.children.propEditor.recalcPositionParameters()
                    await this.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                },
                droppedchild: async (ev) => {
                    await this.callStudioApi('addChildComponent', {
                        childId: ev.detail.childId,
                        childClassName: ev.detail.childClassName, 
                        childPath: ev.detail.childPath,
                        position: ev.detail.position,
                    })
                },
                deletedchildren: async (ev) => {
                    await this.callStudioApi('removeChildComponents', {childIds: ev.detail.childIds})
                },
            },
        }),
        projectBrowser: new ProjectBrowser({
            parent: this,
            position: {left: "0px", width: "300px", top: "20px", bottom: "50%"},
            properties: {},
            eventHandlers: {
                openComponent: (ev) => this.openComponent(ev.detail.mod, ev.detail.cmp)
            },
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
                componentInfo: "Prop('componentInfo')",
                cmpSelection: "Prop('cmpSelection')",
            },
            eventHandlers: {
                positionpropchanged: async (ev) => {
                    this.children.canvas.setChildPosition(ev.detail.childId, ev.detail.newPosition)
                    await this.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                },
                ownPropChanged: async (ev) => {
                    this.children.canvas.setOwnPropBinding(ev.detail.propertyName, ev.detail.newBinding)
                    await this.callStudioApi('setOwnPropBinding', {
                        propertyName: ev.detail.propertyName,
                        newBinding: ev.detail.newBinding,
                    })
                },
                childPropChanged: async (ev) => {
                    await this.callStudioApi('setChildProp', {
                        childId: ev.detail.childId,
                        propName: ev.detail.propName,
                        value: ev.detail.value,
                    })
                },
            },
        }),
        codeEditor: new CodeEditor({
            parent: this,
            position: {left: '300px', right: '300px', height: '300px', bottom: '0px'},
            properties: {
                componentInfo: "Prop('componentInfo')",
            },
            eventHandlers: {
                codeContentChanged: async (ev) => {
                    await this.callStudioApi('setComponentCode', {
                        oldCode: ev.detail.oldCode,
                        newCode: ev.detail.newCode,
                    })
                    this.prop.cmpSelection = {}
                }
            },
        }),
    }

    async openComponent(moduleName, componentName) {
        this.prop.moduleName = moduleName
        this.prop.componentName = componentName

        console.log("Open component", moduleName, componentName)
        this.cnt++
        let mdl = await import(`/API/Studio/openComponent?module=${moduleName}&component=${componentName}&v=${this.cnt}`)

        // cls is the class of the template that we'er going to edit
        this.prop.componentClass = mdl.default
        this.prop.componentInstance = this.children.canvas.setComponent(this.prop.componentClass)
        
        let {code, ast} = mdl
        this.prop.componentInfo = {ast, code}
    }

    /**
     * Call an api function on the studio API
     * @param {string} apiFunction  function name of the Studio API
     * @param  {object} args any additional arguments to send to the body
     */
    async callStudioApi(apiFunction, args) {
        let message = {}
        message['studio/' + apiFunction] = {
            module: this.prop.moduleName,
            component: this.prop.componentName,
            ...args
        }
        await messager.sendMessage(message)
    }
}

export default StudioWindow