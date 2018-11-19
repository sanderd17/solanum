/** @type {WebSocket} - WebSocket instance to the server */
let ws

function connectToWebSocket() {
    try {
        ws = new WebSocket("ws://192.168.0.192:8840/socket") // TODO config
        ws.onopen = function(event) {
            console.log("connection established")
            document.getElementById('errorOverlay').style.visibility = 'hidden'
        }
        ws.onmessage = function (event) {
            let data = JSON.parse(event.data)
            for (let k in data) {
                console.log("Received message " + k)
                handleMessage(k, data[k])
            }
        }
        ws.onclose = function(event) {
            console.log("WebSocket connection closed")
            document.getElementById('errorOverlay').style.visibility = 'visible'
        }
        ws.onerror = function(event) {
            console.error("WebSocket connection error: " + event)
        }
    } catch (e) {
        console.log("Failed to make WebSocket connection")
    }
}

function checkWebSocketOpened() {
    if (ws.readyState != 1) {
        console.log("Websocket wasn't open, try to reopen")
        document.getElementById('errorOverlay').style.visibility = 'visible'
        try {
            ws.close()
        } catch (e) {
            // Wonder what could happen here. closing while in init state?
            // Timing should make sure this doesn't happen.
            // New connections are only made in the previous call of this function
            // and they should definately be resolved by this time, or the server 
            // is down
        }
        connectToWebSocket()
    } else {
        document.getElementById('errorOverlay').style.visibility = 'hidden'
    }
}

setInterval(checkWebSocketOpened, 10000) // TODO timing determines when disconnect is detected and when reconnect attemps happen. Should be configurable
connectToWebSocket()

/******************************
 ****** Message handling ******
 ******************************/
/** @type {Object<string,(data:any) => void>} */
let messages = {}

/**
 * 
 * @param {string} msgName 
 * @param {any} data 
 */
function handleMessage(msgName, data) {
    messages[msgName](data)
}

/**
 * 
 * @param {string} msgName 
 * @param {(data:any) => void} handler 
 */
function registerMessageHandler(msgName, handler) {
    messages[msgName] = handler
}

// EXPORTS
export default ws
export { registerMessageHandler }
