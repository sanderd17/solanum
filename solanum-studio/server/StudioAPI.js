import ComponentStore from './ComponentStore.js'
import ComponentModifier from './ComponentModifier.js'
import ComponentHistorian from './ComponentHistorian.js'

import TagStore from './TagStore.js'
import TagModifier from './TagModifier.js'
import TagHistorian from './TagHistorian.js'

import jsonschema from 'jsonschema'
import * as schema from './StudioApiSchema.js'

import ClientList from '../../solanum-core/server/ClientList.js' // TODO fix loading from related modules; Use a module loader with URL support?
import ClientConnection from '../../solanum-core/server/ClientConnection.js'
import TagFolder from '../../solanum-core/server/TagFolder.js'

import {codeLocToString, getPropertyKeyName} from '../public/lib/AstNavigator.js'


/*
Studio should provide methods to set different parts of the code:

Every operation should be atomic, so simultaneous edits can be made without corrupting the code.
Syntax validation should be done before saving the code, in case of a syntax error, the error should be returned to the interface

* Add / Remove new child template (and fix imports)
* Set position of child template
* Set props object of child template
* Set default props of own template
* Add / remove / change event handlers
 */

/**
 * An editor instance will need to be created once for the app
 * This interface offers the interface metods to read and modify
 * resources.
 * 
 * All methods defined here are exposed to the client interface
 */
class StudioAPI {
    /**
     * Construct the editor interface of the app
     * @param {import('express').Application} app 
     * @param {*} config JSON configuration
     * @param {import('../../solanum-core/server/TagSet').default} ts
     */
    constructor(app, config, ts) {
        this.app = app
        /** Configuration of the app (see /config.js)*/
        this.config = config
        /** Tagset */
        this.ts = ts
        /** Object representing locked files */
        this.locks = {}
        this.componentStore = new ComponentStore(config)
        this.componentHistorian = new ComponentHistorian()

        this.tagStore = new TagStore(config, ts)
        this.tagHistorian = new TagHistorian()
    }

    initMessageHandlers() {
        // Components
        this.app.get('/API/Studio/openComponent', async (req, res) => await this.openComponent(req, res))
        this.app.get('/API/Studio/getComponentPaths', async (req, res) => res.send(await this.getComponentPaths()))
        // Tags
        this.app.get('/API/Studio/getSubTags', async (req, res) => await this.getSubTags(req, res))
        this.app.get('/API/Studio/getTagParams', async (req, res) => await this.getTagParams(req, res))

        let handleClientMessage = (client, data, messageName) => this.handleClientMessage(client, data, messageName)
        // Components
        ClientConnection.on('studio/setComponentCode', handleClientMessage)
        ClientConnection.on('studio/setChildPosition', handleClientMessage)
        ClientConnection.on('studio/addChildComponent', handleClientMessage)
        ClientConnection.on('studio/removeChildComponents', handleClientMessage)
        ClientConnection.on('studio/setOwnPropBinding', handleClientMessage)
        ClientConnection.on('studio/setChildPropBinding', handleClientMessage)
        // Tags
        ClientConnection.on('studio/addTag', handleClientMessage)
        ClientConnection.on('studio/deleteTag', handleClientMessage)
        ClientConnection.on('studio/moveTag', handleClientMessage)
        ClientConnection.on('studio/setTagParam', handleClientMessage)
        ClientConnection.on('studio/setTagType', handleClientMessage)
    }

    /**
     * Finds all files from the config.editableDirs
     * and returns the paths.
     */
    async getComponentPaths() {
        return await this.componentStore.getComponentPaths()
    }

    /**
     * Get the component file to load into the editor
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    async openComponent(req, res) {
        let cmpFile = this.componentStore.getFile(req.query.module, req.query.component)
        let cmpCode = await cmpFile.read_NOLOCK()
        let cmpMod = new ComponentModifier(cmpCode)

        // Add own code as string, and add ast tree for editor
        // Avoid version differences by including the same loaded file
        // FIXME: don't do this...
        cmpCode += '\n;export let code = ' + JSON.stringify(cmpCode)
        cmpCode += '\n;export let ast = ' + JSON.stringify(cmpMod.ast)
        res.type('application/javascript')
        res.send(cmpCode)
    }

    /**
     * @param {ClientConnection} sourceClient
     * @param {*} data
     * @param {string} messageName
     */
    async handleClientMessage(sourceClient, data, messageName) {
        let functionName = messageName.split('/')[1]
        if (!this[functionName]) {
            console.error("Got a request for an unknown message in studio: ", messageName)
            sourceClient.sendMessage({'studio' : "ERROR: Received unknown message type " + messageName})
            return
        }

        let result = jsonschema.validate(data, schema[functionName], {throwError: false})
        if (!result.valid) {
            console.error(`Could not validate json schema for function ${functionName}`, data)
            sourceClient.sendMessage({'studio' : "ERROR: Received invalid data for studio function " + functionName})
            return
        }

        let code = await this[functionName](data)
        // TODO can the ComponentModifier be reused from the modifying function, is the AST clean enough?
        let ast = new ComponentModifier(code).ast


        let message = {}
        message[messageName] = {
            data,
            code,
            ast,
        }
        for (let client of ClientList) {
            if (client != sourceClient)
                client.sendMessage(message)
        }
        // notify the source separately
        message[messageName].isChangeSource = true
        sourceClient.sendMessage(message)
    }


    // Component modifications

    /**
     * @param {*} body
     */
    async setComponentCode(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        // TODO support some diffing?
        let newCmpCode = body.newCode
        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async setOwnPropBinding(body) {
        console.log(body.propertyName, body.newBinding)
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setOwnPropBinding(body.propertyName, body.newBinding)
        let newCmpCode = cmpMod.print()
        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async addChildComponent(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.addChildComponent(body.childId, body.childClassName, body.childPath, body.position)

        let newCmpCode = cmpMod.print()
        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async removeChildComponent(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeChildComponent(body.childId)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async removeChildComponents(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        for (let id of body.childIds) {
            cmpMod.removeChildComponent(id)
        }
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async setChildPosition(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildPosition(body.childId, body.position)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async setChildPropBinding(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        for (let childId of body.childIds) {
            cmpMod.setChildProp(childId, body.propertyName, body.newBinding)
        }
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async setChildEventHandler(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildEventHandler(body.childId, body.eventId, body.eventHandler)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async removeChildEventHandler(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeChildEventHandler(body.childId, body.eventId)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {*} body
     */
    async setDefaultProp(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setDefaultProp(body.propName, body.value)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }
    /**
     * @param {*} body
     */
    async removeDefaultProp(body) {
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        this.componentHistorian.registerChange(body.module, body.component, cmpCode, body)
        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeDefaultProp(body.propName)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * Get all sub tags of a certain path
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    async getSubTags(req, res) {
        let parentpath = req.query.parentpath
    
        let folder = this.ts.getTag(parentpath)
        if (!folder || !(folder instanceof TagFolder)) {
            res.send([])
            return
        }
        let children = folder.children
        let ret = []
        for (let [name, subtag] of children) {
            ret.push({
                name,
                path: subtag.tagpath.join('.'),
                type: subtag.constructor.toString(),
                parameters: {}
            })
        }
        res.send(ret)
    }

    /**
     * Get all sub tags of a certain path
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    async getTagParams(req, res) {
        let [tagset, ...tagpath] = req.query.tagpath.split('.')
        
        let tag = this.ts.getTag(req.query.tagpath)

        let parameters = {}
        parameters.description = tag.constructor.parameters
        
        let tagFile = this.tagStore.getFile(tagset)
        let tagCode = await tagFile.read_NOLOCK()

        let tagMod = new TagModifier(tagCode)
        let tagParamAst = tagMod.getTagParameterAst(tagpath, tagMod.tagsObject)

        parameters.values = {}
        for (let prop of tagParamAst.properties) {
            if (prop.type != "Property")
                continue
            let key = getPropertyKeyName(prop)
            parameters.values[key] = codeLocToString(tagCode, prop.value.loc)
        }

        res.send(parameters)
    }

    /**
     * @param {*} body
     */
    async addTag(body) {
        let tagFile = this.tagStore.getFile(body.tagfile)
        let tagCode = await tagFile.read()

        this.tagHistorian.registerChange(body.tagfile, body.component, tagCode)
        let tagMod = new TagModifier(tagCode)

        tagMod.addTag(body.tagpath, body.tagType, body.tagDescription)
        let newTagCode = tagMod.print()

        await tagFile.write(newTagCode)
        return newTagCode
    }
}

export default StudioAPI
