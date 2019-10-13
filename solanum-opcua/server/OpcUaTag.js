import opcua  from 'node-opcua'

import Tag from 'solanum-core/server/Tag.js'
import ts from 'solanum-core/server/TagSet.js'

import opcUaConnections from './OpcUaConnectionManager.js'

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
        let connection = opcUaConnections.getConnection(this.connectionName)
        let subscription = connection.getSubscription(this.subscriptionName)
        let samplingOptions = {
            samplingInterval: 10, // interval of sampling between OPC server and its data source, can be limited by the OPC server
            discardOldest: true, // whether the oldest values must be discarded
            queueSize: 1, // maximum number of values that will be shown in a message
            // The example here is only interested in the latest change
        }
        let monitoredItem = subscription.monitor(
            {nodeId: this.nodeId, attributeId: opcua.AttributeIds.Value},
            samplingOptions,
            opcua.read_service.TimestampsToReturn.Both
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

