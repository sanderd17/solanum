function Client (ws, ip) {
    this.ws = ws
    this.ip = ip
    this.pingTimerId = 0

    ws.on('message', (msg) => {
        this.handleMessage(msg)
    });
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

Client.prototype.handleMessage = function(msg) {
    for (let key in msg) {
        // TODO log somewhere if a message doesn't exist
        Client.messageTypes[key](msg[key], this)
    }

}

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

Client.messageTypes = {}
Client.addMessageHandler = function(name, fn) {
    // TODO warn for double message adding      +1

    Client.messageTypes[name] = fn
}

export default Client
