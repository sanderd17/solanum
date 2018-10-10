function Messager () {
    this.ws = null
    this.intervalId = 0
    this.messages = {}
    this.server = null
}

Messager.prototype.connectToServer = function(server, WS=WebSocket) {
    this.server = server
    try{
        this.ws = new WS(`ws://${server}/socket`)
        this.ws.onopen = function(event) {
            console.log("connection established")
            document.getElementById('errorOverlay').style.visibility = 'hidden'
        }
        this.ws.onmessage = function (event) {
            let data = JSON.parse(event.data)
            for (let k in data) {
                console.log("Received message " + k)
                handleMessage(k, data[k])
            }
        }
        this.ws.onclose = function(event) {
            console.log("WebSocket connection closed")
            document.getElementById('errorOverlay').style.visibility = 'visible'
        }
        this.ws.onerror = function(event) {
            console.error("WebSocket connection error: " + event)
        }
    } catch (e) {
        console.log("Failed to make WebSocket connection")
    }
    if (!this.intervalId) {
        this.intervalId = setInterval(() => this.checkWebSocketOpened(), 10000) // TODO: should be setting, determines when disconnects are discovered and reconnects are attempted
    }
}

Messager.prototype.checkWebSocketOpened = function() {
    if (this.ws.readyState != 1) {
        console.log("Websocket wasn't open, try to reopen")
        document.getElementById('errorOverlay').style.visibility = 'visible'
        try {
            this.ws.close()
        } catch (e) {
            // Wonder what could happen here. closing while in init state?
            // Timing should make sure this doesn't happen.
            // New connections are only made in the previous call of this function
            // and they should definately be resolved by this time, or the server~
            // is down
        }
        this.connectToServer(this.server)
    } else {
        document.getElementById('errorOverlay').style.visibility = 'hidden'
    }

}

Messager.prototype.handleMessage = function(msgName, data) {
    messages[msgName](data)
}

Messager.prototype.registerMessageHandler = function(msgName, handler) {
    messages[msgName] = handler
}

let messager = new Messager()

export default messager
