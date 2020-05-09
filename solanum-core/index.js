import path from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import bodyParser from 'body-parser'
import expressWs from 'express-ws'

import ClientConnection from './server/ClientConnection.js'
import clientList from './server/ClientList.js'
import TagSet from './server/TagSet.js'
import Reloader from './server/Reloader.js'
import IconManager from './server/IconManager.js'

import tagtypes from './server/TagTypes.js'
import MemoryTag from './server/MemoryTag.js'
import systemTags from './server/tags/system.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class Solanum {
    /**
     * @param {express.Application} app 
     * @param {*} config 
     */
    constructor(app, config) {
        this.app = app
        this.config = config
        this.ts = new TagSet(app, config)
        this.ts.initMessageHandlers()

        this.modules = []
    }

    async init() {
        expressWs(this.app)
        this.app.use(bodyParser.json({'limit': '10MB'})) // auto parse json into req.body

        for (let dir of this.config.publicDirs) {
            this.app.use(express.static(dir))
        }
        this.app.use('/scripts', 
            express.static(path.join(__dirname, '../node_modules')))

        // add font directories
        this.app.use('/fonts',
            express.static(path.join(__dirname, './node_modules/material-design-icons/iconfont')))

        this.app.get('/icons', (req, res) => {
            iconManager.getIcon(req, res)
        })

        // @ts-ignore -- Wait until websockets are native in express
        this.app.ws('/socket', function(ws, req) {
            let cl = new ClientConnection(ws, req.connection.remoteAddress)
            clientList.add(cl)

            console.log('Added new client: # ' + clientList.size)
            ws.on('close', function(msg) {
                // Delete from the client list
                for (let cl of clientList) {
                    if (cl.ws == ws) {
                        clientList.delete(cl)
                    }
                }
                console.log('Removed client: # ' + clientList.size)
            })
        })

        let reloader = new Reloader(this.app, this.config)

        let iconManager = new IconManager()
        iconManager.addIconSet('material-design', path.join(__dirname, 'node_modules', 'material-design-icons'), '(.*)/svg/production/(.*)\\.svg')

        tagtypes['MemoryTag'] = MemoryTag
        this.ts.setTags(systemTags)

        for (let m of this.modules) {
            await m.init()
        }
    }

    addModule(cnstr) {
        this.modules.push(new cnstr(this))
    }
}


export default Solanum
