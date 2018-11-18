class Client {
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

Client.prototype.initPing = function() {
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
 * @param {Object<string, Object>} msg 
 */
Client.prototype.handleMessage = function(msg) {
    for (let key in msg) {
        console.log('received message ' + key)
        // TODO log somewhere if a message doesn't exist
        if (!Client.messageTypes[key]) {
            console.log("Message not found: " + key)
            continue
        }
        Client.messageTypes[key](this, msg[key])
    }
}

/**
 * @param {Object} msg 
 */
Client.prototype.sendMessage = function(msg) {
    return new Promise((resolve, reject) => {
        try {
            this.ws.send(JSON.stringify(msg), (err) => {
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
 * @typedef {function(Client, Object): undefined} MessageHandler
 */

/** @type {Object<string, MessageHandler>} */
Client.messageTypes = {}
/**
 * Register a message handler for a certain message coming from a client
 * @param {string} name - Name of the message
 * @param {MessageHandler} fn - Function to handle message
 */
Client.on = function(name, fn) {
    // TODO warn for double message adding

    Client.messageTypes[name] = fn
}

export default Client
