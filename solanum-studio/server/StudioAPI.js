import ComponentStore from './ComponentStore.js'
import ComponentModifier from './ComponentModifier.js';

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
     */
    constructor(app, config) {
        /** Configuration of the app (see /config.js)*/
        this.config = config
        /** Object representing locked files */
        this.locks = {}
        this.componentStore = new ComponentStore(config)
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
        cmpCode += '\n;export let code = ' + JSON.stringify(cmpCode)
        cmpCode += '\n;export let ast = ' + JSON.stringify(cmpMod.ast)
        res.type('application/javascript')
        res.send(cmpCode)
    }

    // Component modifications

    /**
     * @param {import('express').Request} req 
     */
    async setComponentCode(req) {
        const body = req.body
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()
        // TODO perform some diffing?
        let newCmpCode = body.newCode
        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async setOwnPropBinding(req) {
        const body = req.body
        console.log(body.propertyName, body.newBinding)
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setOwnPropBinding(body.propertyName, body.newBinding)
        let newCmpCode = cmpMod.print()
        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async addChildComponent(req) {
        const body = req.body
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.addChildComponent(body.childId, body.childClassName, body.childPath, body.position)

        let newCmpCode = cmpMod.print()
        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async removeChildComponent(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeChildComponent(body.childId)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async removeChildComponents(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        for (let id of body.childIds) {
            cmpMod.removeChildComponent(id)
        }
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async setChildPosition(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildPosition(body.childId, body.position)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async setChildProp(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildProp(body.childId, body.propName, body.value)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async setChildEventHandler(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildEventHandler(body.childId, body.eventId, body.eventHandler)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async removeChildEventHandler(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeChildEventHandler(body.childId, body.eventId)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }

    /**
     * @param {import('express').Request} req 
     */
    async setDefaultProp(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setDefaultProp(body.propName, body.value)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }
    /**
     * @param {import('express').Request} req 
     */
    async removeDefaultProp(req) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeDefaultProp(body.propName)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        return newCmpCode
    }
}

export default StudioAPI
