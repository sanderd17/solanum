import path from 'path'
import chokidar from 'chokidar'
import clientList from './ClientList.js'

class Reloader {

    constructor(app, config) {
        for (let dir of config.publicDirs) {
            let glob = path.join(dir, '**/*.js')
            chokidar.watch(glob).on('all', (event, path) => this.onFileChange(dir, event, path))
        }
    }

    /**
     * @param {string} dir 
     * @param {*} event 
     * @param {string} path 
     */
    onFileChange(dir, event, path) {
        let fileName = path.substring(dir.length)
        console.log(dir, event, fileName)
        for (let client of clientList) {
            client.sendMessage({'Reloader:fileReloaded': fileName})
        }
    }
}

export default Reloader