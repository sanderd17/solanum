class ClientConnection {
    /**
     * @param {WebSocket} ws 
     * @param {string} ip 
     */
    constructor(ws, ip) {
        this.ws = ws
        this.ip = ip
        this.pingTimerId = null

        ws.on('message', (msg) => {
            this.handleMessage(JSON.parse(msg))
        });
    }
}

ClientConnection.prototype.initPing = function() {
    function ping() {
        try {
            this.ws.ping(+new Date())
        } catch (e) {
            this.ws.close()
            clearInterval(this.pingTimerId)
            console.log("ping failed, closing websocket")
        }
    }
    this.ws.on("pong", (date) => {
        console.log(`ping received in ${(+new Date()) - date}ms`)
        //this.sendTags(this.createDummyTags())
    })
    this.pingTimerId = setInterval(ping, 5000) // TODO should be setting
}

/**
 * @param {Object<string, object>} msg 
 */
ClientConnection.prototype.handleMessage = function(msg) {
    for (let key in msg) {
        console.log('received message ' + key)
        // TODO log somewhere if a message doesn't exist
        if (!ClientConnection.messageTypes[key]) {
            console.log("Message not found: " + key)
            continue
        }
        for (let handler of ClientConnection.messageTypes[key]){
            handler(this, msg[key], key)
        }
    }
}

/**
 * @param {object} msg 
 */
ClientConnection.prototype.sendMessage = function(msg) {
    return new Promise((resolve, reject) => {
        try {
            let msgString = JSON.stringify(msg)
            this.ws.send(msgString, (err) => {
                if (err)
                    reject(err)
                else
                    resolve()
            })
        } catch (e) {
            this.ws.close()
            console.log("send message failed, closing websocket")
            console.log(e)
            reject(e)
        }
    })
}

/**
 * @typedef {(client: ClientConnection, data: object, [messageName]: string) => void} MessageHandler
 */

/** @type {Object<string,Array<MessageHandler>>} */
ClientConnection.messageTypes = {}
/**
 * Register a message handler for a certain message coming from a client
 * @param {string} name - Name of the message
 * @param {MessageHandler} fn - Function to handle message
 */
ClientConnection.on = function(name, fn) {
    // TODO warn for double message adding

    if (!(name in ClientConnection.messageTypes)) {
        ClientConnection.messageTypes[name] = []
    }
    ClientConnection.messageTypes[name].push(fn)
}

export default ClientConnection
