import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import StudioAPI from './server/StudioAPI.js'
import TagAPI from './server/TagAPI.js'



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SolanumStudio {
    /**
     * 
     * @param {import('../solanum-core/index').default} solanum 
     */
    constructor(solanum) {
        this.app = solanum.app
        this.config = solanum.config
        this.ts = solanum.ts
    }

    async init() {
        const studioAPI = new StudioAPI(this.app, this.config)
        const tagAPI = new TagAPI(this.app, this.config, this.ts)

        studioAPI.initMessageHandlers()
        tagAPI.initMessageHandlers()

        this.app.use('/monaco', express.static(path.join(__dirname, 'node_modules/monaco-editor/')))
    }
}

export default SolanumStudio