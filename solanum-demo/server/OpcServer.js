import opcua from 'node-opcua'
import os from 'os'

export default function createDemoOpcServer() {
    // Let create an instance of OPCUAServer
    const server = new opcua.OPCUAServer({
        port: 4334,        // the port of the listening socket of the server
        buildInfo: {
            productName: "SolanumDemoServer",
            buildNumber: "1",
            buildDate: new Date(),
        }
    });

    server.initialize(() => {
        //console.log(server)

        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

        // we create a new folder under RootFolder
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "DemoServer"
        })
        // add a variable named MyVariable1 to the newly created folder "MyDevice"
        let variable1 = 1

        // emulate variable1 changing every 50 ms
        setInterval(() => variable1 = (variable1 + 1) % 2**16 , 50)

        namespace.addVariable({
            componentOf: device,
            browseName: "iWatchDog",
            nodeId: 's=iWatchDog',
            dataType: "Integer",
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.Int32, value: variable1 })
                }
            }
        })

        /**
         * @param {opcua.UAObject} parentFolder 
         * @param {string} browseName 
         * @param {string} [nodeId]
         */
        function addFolder(parentFolder, browseName, nodeId) {
            if (nodeId == null)
                nodeId = parentFolder.nodeId + '/' + browseName
            return namespace.addFolder(parentFolder, {browseName, nodeId})
        }

        /**
         * 
         * @param {opcua.UAObject} parentFolder 
         * @param {string} browseName 
         * @param {opcua.DataType} dataType 
         * @param {*} value
         * @param {boolean} [writeable] default false
         */
        function addVariable(parentFolder, browseName, dataType, value, writeable){
            let nodeValue = {
                get: () => new opcua.Variant({dataType, value})
            }
            if (writeable) {
                nodeValue.set = (variant) => {
                    value = variant.value
                    return opcua.StatusCodes.Good
                }
            }
            const nodeId = parentFolder.nodeId + '/' + browseName

            namespace.addVariable({
                componentOf: parentFolder,
                browseName,
                nodeId,
                dataType,
                value: nodeValue
            })
        }

        const objectsFolder = addressSpace.rootFolder.objects
        const motorsNode  = addFolder(objectsFolder, "10 Motors", 's=10 Motors')
        const dolNode = addFolder(motorsNode, '11 DOL')
    
        for (let i = 0; i < 100; i++) {
            let motorName = 'M' + (i).toString().padStart(3, '0')
            const motorNode = addFolder(dolNode, motorName)
            addVariable(motorNode, 'bAuto', opcua.DataType.Boolean, false, true)
            addVariable(motorNode, 'iState', opcua.DataType.Int32, 2, false)
        }

        let variable2 = false;
        namespace.addVariable({
            componentOf: device,
            nodeId: "b=1020ffab", // some opaque NodeId in namespace 4
            browseName: "Percentage Memory Used",
            dataType: "Double",
            minimumSamplingInterval: 1000,
            value: {
                get: () => {
                    // const value = process.memoryUsage().heapUsed / 1000000;
                    const memUsed = 1.0 - (os.freemem() / os.totalmem());
                    return new opcua.Variant({dataType: opcua.DataType.Double, value: memUsed * 100});
                }
            }
        })

        server.start(function() {
            console.log("OPC Server is now listening ... ( press CTRL+C to stop)");
            console.log("port ", server.endpoints[0].port);
            const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
            console.log(" the primary server endpoint url is ", endpointUrl );
        });

    })
    return server
}
