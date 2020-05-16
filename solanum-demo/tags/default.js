import MemoryTag from 'solanum-core/server/MemoryTag.js'
import OpcUaTag from 'solanum-opcua/server/OpcUaTag.js'
import ST_Motor from '../server/tagTypes/ST_Motor.js'

let tags = {
    'testMemoryTag': new MemoryTag({
        defaultValue: 0,
    }),
}

for (let i = 0; i < 3000; i++) {
    tags[`Motors.M${i}`] = new ST_Motor({
        sId: `M${i}`,
        i: i,
    })
}
tags.watchDog = new OpcUaTag({
    connection: "DemoServer",
    subscription: "default",
    ns: 1,
    nodeId: "ns=1;s=iWatchDog",
})
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
