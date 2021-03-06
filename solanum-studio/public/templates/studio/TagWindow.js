import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"
import TagBrowser from '/templates/studio/tagBrowser/TagBrowser.js'
import Label from '/templates/forms/Label.js'

import TagParams from './tagParams/TagParams.js'

import messager from '/lib/Messager.js'
import {getChildAst} from '/lib/AstNavigator.js'

// TODO messaging to the studio API should go into a singleton class that can be imported from other classes it should have a link to this StudioWindow to have access to the needed children
/**
 * StudioWindow is responsible for all synchronisation between the components and with the server
 * 
 * When a component has an update caused by user interaction, it must send a message over the DOM
 * The StudioWindow will pass the message on to the server
 * The server will respond to all connected studio instances
 * Upon response from the server, all related child components will be updated:
 *  * The souce code will be updated
 *  * The visuals will be updated
 *  * The visible data will be updated
 */
class StudioWindow extends Template {
    constructor(args) {
        super(args)
        this.init()

        //messager.registerMessageHandler('studio/addTag', reply => this.addTag(reply))
        //messager.registerMessageHandler('studio/deleteTag', reply => this.deleteTag(reply))
        //messager.registerMessageHandler('studio/moveTag', reply => this.moveTag(reply))
        //messager.registerMessageHandler('studio/setTagParam', reply => this.setTagParam(reply))
        //messager.registerMessageHandler('studio/setTagType', reply => this.setTagType(reply))
    }

    properties = {
        tagSelection: new Prop('', (newSelection) => {
            if (!newSelection)
                return

            // TODO set info on other pane
        }),
        positionUnit: new Prop('px')
    }

    children = {
        tagBrowser: new TagBrowser({
            parent: this,
            position: {left: "0px", width: "300px", top: "0px", bottom: "0px"},
            properties: {},
            eventHandlers: {
                selectionchanged: (ev) => {
                    this.prop.tagSelection = ev.detail.selection
                },
            },
        }),
        label: new Label({
            parent: this,
            position: {left: '400px', top: '20px', width: '200px', height: '20px'},
            properties: {
                text: () => this.prop.tagSelection,
            }
        }),
        tagParams: new TagParams({
            parent:this,
            position: {left: '400px', top: '60px', width: '600px', height: '600px'},
            properties: {
                tagpath: () => this.prop.tagSelection,
            },
            eventHandlers: {
                tagParamChanged: (ev) => {
                    this.callStudioApi('setTagParam', ev.detail)
                }
            },
        }),
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