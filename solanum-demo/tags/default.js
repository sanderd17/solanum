import MemoryTag from 'solanum-core/server/MemoryTag.js'
import OpcUaTag from 'solanum-opcua/server/OpcUaTag.js'

/**
 * @type {Object<string, import ('../../solanum-core/server/TagSet.js').TagDescription>}
 */
let tags = {
    'testMemoryTag': {
        type: MemoryTag,
        defaultValue: 0,
    },
    Motors: {
        M1: {
            type: MemoryTag,
            defaultValue: 1
        }
    },
    'Motors.M2': {
        type: MemoryTag,
        defaultValue: 2
    }
}

for (let i = 0; i < 3000; i++) {
    tags[`Motors/M${i}`] = {
        type: MemoryTag,
        //defaultValue: `hsl(0, 100%, 50%)`
        defaultValue: `hsl(${(i) % 360}, 100%, 50%)`
    }
}
tags.watchDog = {
        type: OpcUaTag,
        connection: "DemoServer",
        subscription: "default",
        ns: 1,
        nodeId: "ns=1;s=iWatchDog",
}
    /*
    testUdtInst: {
            type: "UdtInstance",
            udtType: "ST_MOTOR",
            params: {
                    OPCUA: "PLC01",
                    motorId: "dol_A001",
                    ns: 4,
                }
    },*/



export default tags
