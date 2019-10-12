import opcua  from 'node-opcua'

import Tag from 'solanum-core/server/Tag.js'
import ts from 'solanum-core/server/TagSet.js'


/*
options = {
    securityMode: securityMode,
    securityPolicy: securityPolicy,
    //xx serverCertificate: serverCertificate,
    defaultSecureTokenLifetime: 40000,
    certificateFile: certificateFile,
    privateKeyFile: privateKeyFile
}
 */
function OpcConnection(options, endpoint) {
    this.options = options
    this.endpoint = endpoint
    this.subscriptions = {}
    this.client = new opcUa.OPCUAClient(options)
    this.client.on('start_reconnection', ()=> {
        console.log(`start_reconnection to ${this.endpoint}`)
    })
    this.client.on('backoff', (nb , delay) => {
        console.log(`OPCUA backoff ${this.endpoint} for the ${nb} time ... Retry in ${delay} ms`)
    })
    this.client.on('connection_reestablished', () => {
        console.log(`OPCUA connection_reestablished to ${this.endpoint}` )
    })
    this.client.on('after_reconnection', (err) => {
        console.log(`OPCUA reconnection process to ${this.endpoint} has been completed:\n`, err )
    })
    this.client.on('timed_out_request', (request) => {
        console.log(`OPCUA timed_out_request to ${this.endpoint}:\n`, request)
    })
    this.client.on('close', (err) => {
        console.log(`OPCUA close ${this.endpoint}:\n`, err)
    })
}

OpcConnection.prototype.connect = async function() {
    await this.client.connect(this.endpoint)

    this.session = await this.client.createSession()
    console.log(`Session to ${this.endpoint} created`)
}
/*
subscriptionOptions = {
    requestedPublishingInterval: 100, // Interval over which server will group changes
    requestedLifetimeCount: 100, // 
    requestedMaxKeepAliveCount: 99999,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10
}
 */
OpcConnection.prototype.createSubscription = function(subscriptionOptions, name) {
    let s = new opcUa.ClientSubscription(session, subscriptionOptions)
    s.on('started', () => {
        console.log(`OPCUA subscription started ${name} (id: ${s.subscriptionId})`)
    })
    s.on('status_changed', (statusCode) => {
        console.log(`OPCUA subscription ${name} status_changed: ${statusCode}`)
    })
    s.on('keepalive', () => {
        console.log(`OPCUA subscription ${name} keepalive`)
    })
    s.on('terminated', () => {
        console.log(`OPCUA subscription ${name} terminated`)
    })
    return s
}

OpcConnection.prototype.getSubscription = function(subscriptionName) {
    if (subscriptionName in this.subscriptions)
        return this.subscriptions(subscriptionName)
    let subscription = this.createSubscription(this.options.subscriptions[subscriptionName], subscriptionName)
    this.subscriptions[subscriptionName] = subscription
    return subscription
}

class OpcUaTag extends Tag {
    /**
     * @param {TagSet} tagSet
     * @param {string} tagPath 
     * @param {{defaultValue: object}} data 
     */
    constructor(tagSet, tagPath, data) {
        super(tagSet, tagPath, data)
        this.value = data.defaultValue
        this.connectionName = data.connection
        this.subscriptionName = data.subscription
        this.nodeId = data.nodeId
        this.quality = 'INIT'
    }

    async init() {
        let connection = await getOpcConnection(this.connectionName)
        let subscription = connection.getSubscription(this.subscriptionName)
        /*{
            samplingInterval: 10, // interval of sampling between OPC server and its data source, can be limited by the OPC server
            discardOldest: true, // whether the oldest values must be discarded
            queueSize: 1, // maximum number of values that will be shown in a message
            // The example here is only interested in the latest change
            // If you want to process all changes, 
        }*/
        samplingOptions = connection.options.subscriptionOptions[this.subscriptionName]
        let monitoredItem = subscription.monitor(
            {nodeId: data.nodeId, attributeId: opcua.AttributeIds.Value},
            samplingOptions,
            opcUa.read_service.TimestampsToReturn.Both
        )
        monitoredItem.on('changed', (value) => {
            this.value = value.value.value
            this.triggerChange()
        })
    }

    triggerChange() {
        ts.triggerChange(this)
    }

    write(value) {
        this.value = value
        this.triggerChange()
    }
}

export default OpcUaTag

