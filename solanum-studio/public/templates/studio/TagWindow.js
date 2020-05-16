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

        messager.registerMessageHandler('studio/addTag', reply => this.addTag(reply))
        messager.registerMessageHandler('studio/deleteTag', reply => this.deleteTag(reply))
        messager.registerMessageHandler('studio/moveTag', reply => this.moveTag(reply))
        messager.registerMessageHandler('studio/setTagParam', reply => this.setTagParam(reply))
        messager.registerMessageHandler('studio/setTagType', reply => this.setTagType(reply))
    }

    children = {
        tagBrowser: new TagBrowser({
            parent: this,
            position: {left: "0px", width: "300px", bottom: "0px", height: "100%"},
            properties: {},
            eventHandlers: {},
        }),
    }
}

export default StudioWindow