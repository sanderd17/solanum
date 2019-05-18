function Messager () {
    this.ws = null
    this.intervalId = null
    /** @type {Object<string,(data: any) => void>} */
    this.messages = {}
    this.server = ""
    /** @type {Array<(event: Event) => undefined>} */
    this.onopenHandlers = []
}

/**
 * @param {string} server 
 */
Messager.prototype.connectToServer = function(server, WS=WebSocket) {
    this.server = server
    try{
        this.ws = new WS(`ws://${server}/socket`)
        this.ws.onopen = (event) => {
            console.log("connection established")
            document.getElementById('errorOverlay').style.visibility = 'hidden'
            for (let handler of this.onopenHandlers) {
                handler(event)
            }
        }
        this.ws.onmessage = (event) => {
            let data = JSON.parse(event.data)
            for (let k in data) {
                console.log("Received message " + k)
                this.handleMessage(k, data[k])
            }
        }
        this.ws.onclose = (event) => {
            console.log("WebSocket connection closed")
            document.getElementById('errorOverlay').style.visibility = 'visible'
        }
        this.ws.onerror = (event) => {
            console.error("WebSocket connection error: " + event)
        }
    } catch (e) {
        console.log("Failed to make WebSocket connection")
    }
    if (!this.intervalId) {
        // TODO: should be setting, determines when disconnects are discovered and reconnects are attempted
        this.intervalId = setInterval(() => this.checkWebSocketOpened(), 10000) 
    }
}

/**
 * Send a message to the server
 * @param {Object} msg 
 */
Messager.prototype.sendMessage = function(msg) {
    this.ws.send(JSON.stringify(msg))
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

/**
 * Handle a received
 * @param {string} msgName 
 * @param {Object} data 
 */
Messager.prototype.handleMessage = function(msgName, data) {
    if (msgName in this.messages)
        this.messages[msgName](data)
    else
        console.log(`Message '${msgName}' not found in message handlers'`)
}

/**
 * Register a message handler
 * @param {string} msgName -- Message name to react on
 * @param {(data:any) => void} handler -- Function to execute on message received
 */
Messager.prototype.registerMessageHandler = function(msgName, handler) {
    this.messages[msgName] = handler
}

/**
 * Register a function to execute on WebSocket open
 * @param {function(Event)} handler 
 */
Messager.prototype.registerOnopenHandler = function(handler) {
    this.onopenHandlers.push(handler)
}

let messager = new Messager()

export default messager
