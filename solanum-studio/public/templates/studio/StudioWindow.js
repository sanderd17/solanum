import Template from "/lib/template.js"
import StudioCanvas from '/templates/studio/canvas/StudioCanvas.js'
import ProjectBrowser from '/templates/studio/projectBrowser/ProjectBrowser.js'
import TagBrowser from '/templates/studio/tagBrowser/TagBrowser.js'
import PropEditor from '/templates/studio/propEditor/PropEditor.js'
import LayoutBar from "/templates/studio/menuBars/LayoutBar.js"
import CodeEditor from '/templates/studio/codeEditor/Editor.js'


class StudioWindow extends Template {
    static childDefinitions = {
        layoutBar: {
            type: LayoutBar,
            position: {left: '0px', top:'0px', width: '100%', height: '20px'},
            props: {
                positionUnit: 'px'
            },
            eventHandlers: {}
        },
        canvas: {
            type: StudioCanvas,
            position: {left: "300px", right: "300px", top: "20px", bottom: "0px"},
            props: {},
            eventHandlers: {
                selectionchanged: (ev, root) => {
                    let cmpSelection = {}
                    for (let id of ev.detail.selection) {
                        cmpSelection[id] = root.children.canvas.children.preview.children[id]
                    }
                    root.children.propEditor.cmpSelection = cmpSelection
                },
                childpositionchanged: async (ev, root) => {
                    root.children.propEditor.recalcPositionParameters()
                    let newCode = await root.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                },
                droppedchild: async (ev, root) => {
                    let newCode = await root.callStudioApi('addChildComponent', {
                        childId: ev.detail.childId,
                        childClassName: ev.detail.childClassName, 
                        childPath: ev.detail.childPath,
                        position: ev.detail.position,
                    })
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                },
                deletedchildren: async (ev, root) => {
                    let newCode = await root.callStudioApi('removeChildComponents', {childIds: ev.detail.childIds})
                },
            },
        },
        projectBrowser: {
            type: ProjectBrowser,
            position: {left: "0px", width: "300px", top: "20px", height: "50%"},
            props: {},
            eventHandlers: {},
        },
        tagBrowser: {
            type: TagBrowser,
            position: {left: "0px", width: "300px", bottom: "20px", height: "50%"},
            props: {},
            eventHandlers: {},
        },
        propEditor: {
            type: PropEditor,
            position: {right: "0px", width: "300px", top: "20px", bottom: "0px"},
            props: {},
            eventHandlers: {
                positionpropchanged: async (ev, root) => {
                    root.children.canvas.setChildPosition(ev.detail.childId, ev.detail.newPosition)
                    let newCode = await root.callStudioApi('setChildPosition', {
                        childId: ev.detail.childId,
                        position: ev.detail.newPosition,
                    })
                    // TODO do something with the return value. Can be used to distinguish between updates coming from this instance and external updates
                }
            },
        },
        codeEditor: {
            type: CodeEditor,
            position: {left: '300px', right: '300px', height: '300px', bottom: '0px'},
            props: {},
            eventHandlers: {},
        }
    }

    positionUnit = 'px'

    openComponent(mod, cmp) {
        this.mod = mod
        this.cmp = cmp
        this.children.canvas.setComponent(mod, cmp)
        this.children.codeEditor.loadCode(mod, cmp)
    }

    mod = ''
    cmp = ''

    /**
     * Call an api function on the studio API
     * @param {string} apiFunction  function name of the Studio API
     * @param  {object} args any additional arguments to send to the body
     */
    async callStudioApi(apiFunction, args) {
        let body = {
            module: this.mod,
            component: this.cmp,
        }
        for (let [key, value] of Object.entries(args)) {
            body[key] = value
        }
        return await fetch(`/API/studio/${apiFunction}`, {
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
    }
}

export default StudioWindow