import MemoryTag from '../src/MemoryTag.js'

let tags = {
    'testMemoryTag': {
        type: MemoryTag,
        defaultValue: 0,
    },
}

for (let i = 0; i < 3000; i++) {
    tags[`Motors/M${i}`] = {
        type: MemoryTag,
        defaultValue: `hsl(${i}, 100%, 50%)`
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
