import FileTag from '../src/FileTag.js'

let tags = {
    'testFileTag': {
        type: FileTag,
        filePath: `${__dirname}/myVar.txt`,
    },
}

for (let i = 0; i < 3000; i++) {
    tags[`Motors/M${i}`] = {
        type: FileTag,
        filePath: `${__dirname}/myVar${i}.txt`,
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
