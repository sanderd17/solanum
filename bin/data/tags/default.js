import MemoryTag from 'solanum-core/src/MemoryTag.js'

/**
 * @type {Object<string, import ('../../solanum-core/src/TagSet.js').TagDescription>}
 */
let tags = {
    'testMemoryTag': {
        type: MemoryTag,
        defaultValue: 0,
    },
}

for (let i = 0; i < 3000; i++) {
    tags[`Motors/M${i}`] = {
        type: MemoryTag,
        //defaultValue: `hsl(0, 100%, 50%)`
        defaultValue: `hsl(${(i) % 360}, 100%, 50%)`
    }
}
    /*testTag: {
            type: "OpcTag",
            OpcServer: "PLC01",
            ns: 4,
            nodeId: "`OPC.testTag",
    },
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
