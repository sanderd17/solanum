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
    constructor(args) {
        super(args)
        this.init()
        this.cnt = 1
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
                    //this.children.canvas.children.interaction.prop.selection = []
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
                    let newCode = await this.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                    this.openComponent(this.prop.moduleName, this.prop.componentName)
                    // TODO optimize loading changes
                },
                droppedchild: async (ev) => {
                    let newCode = await this.callStudioApi('addChildComponent', {
                        childId: ev.detail.childId,
                        childClassName: ev.detail.childClassName, 
                        childPath: ev.detail.childPath,
                        position: ev.detail.position,
                    })
                    this.openComponent(this.prop.moduleName, this.prop.componentName)
                    // TODO optimize loading changes
                },
                deletedchildren: async (ev) => {
                    let newCode = await this.callStudioApi('removeChildComponents', {childIds: ev.detail.childIds})
                    this.openComponent(this.prop.moduleName, this.prop.componentName)
                    // TODO optimize loading changes
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
                    let newCode = await this.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                    this.openComponent(this.prop.moduleName, this.prop.componentName)
                    // TODO optimize loading changes
                },
                ownPropChanged: async (ev) => {
                    this.children.canvas.setOwnPropBinding(ev.detail.propertyName, ev.detail.newBinding)
                    let newCode = await this.callStudioApi('setOwnPropBinding', {
                        propertyName: ev.detail.propertyName,
                        newBinding: ev.detail.newBinding,
                    })
                    this.openComponent(this.prop.moduleName, this.prop.componentName)
                    // TODO optimize loading changes
                },
                childPropChanged: async (ev) => {
                    let newCode = await this.callStudioApi('setChildProp', {
                        childId: ev.detail.childId,
                        propName: ev.detail.propName,
                        value: ev.detail.value,
                    })
                    this.openComponent(this.prop.moduleName, this.prop.componentName)
                    // TODO optimize loading changes
                },
            },
        }),
        codeEditor: new CodeEditor({
            parent: this,
            position: {left: '300px', right: '300px', height: '300px', bottom: '0px'},
            properties: {},
            eventHandlers: {
                codeContentChanged: async (ev) => {
                    let newCode = await this.callStudioApi('setComponentCode', {
                        oldCode: ev.detail.oldCode,
                        newCode: ev.detail.newCode,
                    })
                    this.openComponent(this.prop.moduleName, this.prop.componentName)
                    // TODO optimize loading changes
                    this.children.propEditor.cmpSelection = []
                }
            },
        }),
    }

    async openComponent(moduleName, componentName) {
        this.prop.moduleName = moduleName
        this.prop.componentName = componentName

        this.cnt++
        let mdl = await import(`/API/Studio/openComponent?module=${moduleName}&component=${componentName}&v=${this.cnt}`)

        // cls is the class of the template that we'er going to edit
        this.prop.componentClass = mdl.default
        this.prop.componentInstance = this.children.canvas.setComponent(this.prop.componentClass)
        
        let code = mdl.code
        // TODO turn into valid property, and pass as property binding
        this.children.codeEditor.code = code

        let ast = mdl.ast
        this.prop.componentInfo = {ast, code}
    }

    /**
     * Call an api function on the studio API
     * @param {string} apiFunction  function name of the Studio API
     * @param  {object} args any additional arguments to send to the body
     */
    async callStudioApi(apiFunction, args) {
        let body = {
            module: this.prop.moduleName,
            component: this.prop.componentName,
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