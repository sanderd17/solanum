import messager from './Messager.js'

class Reloader {
    // TODO: keep track of loaded templates, and check before forcing a reload
    initMessageHandlers() {
        messager.registerMessageHandler('Reloader:fileReloaded', () => location.reload())
    }
}

export default Reloader
