import opcua from "node-opcua"

const timeout = ms => new Promise(res => setTimeout(res, ms))
 
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
        this.options = options
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
        console.log("CREATED")
        subscription.on('started', () => {
            console.debug(`OPCUA subscription started ${name} (id: ${subscription.subscriptionId})`)
            this.subscriptionMap.set(name, subscription)
            console.log('STARTED')
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

    async init(config) {
        this.config = config
        // TODO: PERFORMANCE: make async functions parallel
        for (let serverConfig of this.config.servers) {
            let connection = await this.addConnection(serverConfig.name, serverConfig.endpoint, serverConfig.options)
            for (let subsciptionconfig of this.config.subscriptions) {
                console.log(subsciptionconfig.options)
                await connection.addSubscription(subsciptionconfig.name, subsciptionconfig.options)
            }
        }
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
        return connection
    }

    async subscribeTag(connectionName, subscriptionName, nodeId, changeTrigger) {
        // FIXME limit time for trying if connection exists
        let connection = this.getConnection(connectionName)
        while (connection == null) {
            await timeout(100)
            connection = this.getConnection(connectionName)
        }
        let subscription = connection.getSubscription(subscriptionName)
        while (subscription == null) {
            await timeout(100)
            subscription = connection.getSubscription(subscriptionName)
        }
        let itemToMonitor = {nodeId, attributeId: opcua.AttributeIds.Value}
        // TODO move some options to configuration
        let samplingOptions = {
            samplingInterval: 10, // interval of sampling between OPC server and its data source, can be limited by the OPC server
            discardOldest: true, // whether the oldest values must be discarded
            queueSize: 1, // maximum number of values that will be shown in a message
            // The example here is only interested in the latest change
        }
        let monitoredItem = opcua.ClientMonitoredItem.create(
            subscription,
            itemToMonitor,
            samplingOptions,
            opcua.TimestampsToReturn.Both
        )
        monitoredItem.on('changed', changeTrigger)
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
 
let connectionManager = new OpcUaConnectionManager()
export default connectionManager