/**
 * This file will manage the state of all opc ua connections
 */

import opcua from "node-opcua"
 
export class OpcUaConnection {
    /**
     * manage a new connection
     * @param {string} name 
     * @param {string} endpoint 
     * @param {opcua.OPCUAClientOptions} options 
     */
    constructor(name, endpoint, options) {
        this.name = name
        this.endpoint = endpoint
        this.options = this.options
        /** @type {Map<string, opcua.ClientSubscription>} */
        this.subscriptionMap = new Map()
    }

    async connect() {
        this.client = opcua.OPCUAClient.create(this.options)
        this.client.on('start_reconnection', ()=> {
            console.debug(`start_reconnection to ${this.endpoint}`)
        })
        this.client.on('backoff', (nb , delay) => {
            console.debug(`OPCUA backoff ${this.endpoint} for the ${nb} time ... Retry in ${delay} ms`)
        })
        this.client.on('connection_reestablished', () => {
            console.debug(`OPCUA connection_reestablished to ${this.endpoint}` )
        })
        this.client.on('after_reconnection', (err) => {
            console.debug(`OPCUA reconnection process to ${this.endpoint} has been completed:\n`, err )
        })
        this.client.on('timed_out_request', (request) => {
            console.debug(`OPCUA timed_out_request to ${this.endpoint}:\n`, request)
        })
        this.client.on('close', (err) => {
            console.debug(`OPCUA close ${this.endpoint}:\n`, err)
        })
        await this.client.connect(this.endpoint)
        this.session = await this.client.createSession()
    }

    /**
     * Add a new subscription to this connection, example options: 
     *   subscriptionOptions = {
     *       requestedPublishingInterval: 100, // Interval over which server will group changes
     *       requestedLifetimeCount: 100, // 
     *       requestedMaxKeepAliveCount: 99999,
     *       maxNotificationsPerPublish: 100,
     *       publishingEnabled: true,
     *       priority: 10
     *   }
     * @param {string} name 
     * @param {opcua.SubscriptionOptions} subscriptionOptions 
     */
    addSubscription(name, subscriptionOptions) {
        let subscription = opcua.ClientSubscription.create(this.session, subscriptionOptions)
        subscription.on('started', () => {
            console.debug(`OPCUA subscription started ${name} (id: ${subscription.subscriptionId})`)
        })
        subscription.on('status_changed', (statusCode) => {
            console.debug(`OPCUA subscription ${name} status_changed: ${statusCode}`)
        })
        subscription.on('keepalive', () => {
            console.debug(`OPCUA subscription ${name} keepalive`)
        })
        subscription.on('terminated', () => {
            console.debug(`OPCUA subscription ${name} terminated`)
        })
        this.subscriptionMap.set(name, subscription)
    }

    /**
     * @param {string} name 
     */
    getSubscription(name) {
        return this.subscriptionMap.get(name)
    }
} 

export class OpcUaConnectionManager {
    constructor() {
        /** @type {Map<string, OpcUaConnection>} */
        this.connectionMap = new Map()
    }

    /**
     * Adds a connection and immediately connects to the OPC UA server
     * @param {string} name 
     * @param {string} endpoint 
     * @param {opcua.OPCUAClientOptions} options 
     */
    async addConnection(name, endpoint, options) {
        let connection =  new OpcUaConnection(name, endpoint, options)
        this.connectionMap.set(name,connection)
        await connection.connect()

    }

    /**
     * @param {string} name 
     */
    getConnection(name) {
        return this.connectionMap.get(name)
    }

    /**
     * @param {string} name 
     */
    getClient(name) {
        return this.connectionMap.get(name).client
    }

    /**
     * @param {string} name 
     */
    getSession(name) {
        return this.connectionMap.get(name).session
    }
}
 
const opcUaConnections = new OpcUaConnectionManager()

export default opcUaConnections