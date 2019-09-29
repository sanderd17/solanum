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
     * @param {Express.Application} app 
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
     * @param {Express.Request} req
     * @param {Express.Response} res
     */
    async getComponentPaths(req, res) {
        let filesPerModule = await this.componentStore.getComponentPaths()
        res.send(filesPerModule)
    }

    /**
     * Get the component file to load into the editor
     * @param {Request} req 
     * @param {Response} res 
     */
    async openComponent(req, res) {
        let cmpPath = this.componentStore.getComponentPath(req.query.module, req.query.component)
        res.sendFile(cmpPath)
    }


    // Component modifications

    /**
     * 
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async setComponentCode(req, res) {
        const body = req.body
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()
        // TODO perform some diffing?
        let newCmpCode = body.newCode
        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async addChildComponent(req, res) {
        const body = req.body
        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.addChildComponent(body.childId, body.childClassName, body.childPath, body.position)

        let newCmpCode = cmpMod.print()
        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async removeChildComponent(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeChildComponent(body.childId)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async removeChildComponents(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        for (let id of body.childIds) {
            cmpMod.removeChildComponent(id)
        }
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async setChildPosition(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildPosition(body.childId, body.position)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async setChildProp(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildProp(body.childId, body.propName, body.value)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async setChildEventHandler(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setChildEventHandler(body.childId, body.eventId, body.eventHandler)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async removeChildEventHandler(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeChildEventHandler(body.childId, body.eventId)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }

    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async setDefaultProp(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.setDefaultProp(body.propName, body.value)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }
    /**
     * @param {Request} req 
     * @param {Express.Response} res 
     */
    async removeDefaultProp(req, res) {
        const body = req.body

        let cmpFile = this.componentStore.getFile(body.module, body.component)
        let cmpCode = await cmpFile.read()

        let cmpMod = new ComponentModifier(cmpCode)

        cmpMod.removeDefaultProp(body.propName)
        let newCmpCode = cmpMod.print()

        await cmpFile.write(newCmpCode)
        res.send(newCmpCode)
    }
}

export default StudioAPI