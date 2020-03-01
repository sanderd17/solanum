import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import StudioAPI from './server/StudioAPI.js'
import TagAPI from './server/TagAPI.js'



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SolanumStudio {
    constructor(solanum) {
        this.solanum = solanum
        this.app = solanum.app
        this.config = solanum.config
    }

    async init() {
        const studioAPI = new StudioAPI(this.app, this.config)
        const tagAPI = new TagAPI(this.app, this.config)

        studioAPI.initMessageHandlers()
        tagAPI.initMessageHandlers()

        this.app.use('/monaco', express.static(path.join(__dirname, 'node_modules/monaco-editor/')))
    }
}

export default SolanumStudio