import opcua  from 'node-opcua'

import Tag from 'solanum-core/server/Tag.js'

import connectionManager from './OpcUaConnectionManager.js'

class OpcUaTag extends Tag {
    /**
     * @param {TagSet} tagSet
     * @param {string} tagPath 
     * @param {{defaultValue: object}} data 
     */
    constructor(data) {
        super(data)
        this.value = data.defaultValue
        this.connectionName = data.connection
        this.subscriptionName = data.subscription
        this.nodeId = data.nodeId // FIXME wrong format causes nasty error deep in opcua module. Check format is "ns=x;s=xxx"
        this.quality = 'INIT'
    }

    /**
     * @override
     */
    async init(tagSet, tagpath) {
        await super.init(tagSet, tagpath)
        await connectionManager.subscribeTag(this.connectionName, this.subscriptionName, this.nodeId, (value) => {
            this.value = value.value.value
            this.triggerChange()
        })
    }

    triggerChange() {
        this.ts.triggerChange(this)
    }

    write(value) {
        this.value = value
        this.triggerChange()
    }
}

export default OpcUaTag

