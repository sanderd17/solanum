/**
 * Global singleton to keep track of the active clients
 */
import ClientConnection from './ClientConnection.js'

/**
 * @type {Set<ClientConnection>}
 */
let clientList = new Set()

export default clientList
