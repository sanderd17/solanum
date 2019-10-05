import opcua from 'node-opcua'
import os from 'os'


export default function createDemoOpcServer() {
    // Let create an instance of OPCUAServer
    const server = new opcua.OPCUAServer({
        port: 4334,        // the port of the listening socket of the server
        buildInfo: {
            productName: "SolanumDemoServer",
            buildNumber: "1",
            buildDate: new Date(2019, 10, 5),
        }
    });

    server.initialize(() => {
        console.log(server)

        const addressSpace = server.engine.addressSpace;
        const namespace = addressSpace.getOwnNamespace();

        // we create a new folder under RootFolder
        const device = namespace.addObject({
            organizedBy: addressSpace.rootFolder.objects,
            browseName: "DemoServer"
        })

        // add a variable named MyVariable1 to the newly created folder "MyDevice"
        let variable1 = 1

        // emulate variable1 changing every 500 ms
        setInterval(() => variable1 = (variable1 + 1) % 2**16 , 50)

        namespace.addVariable({
            componentOf: device,
            browseName: "iWatchDog",
            nodeId: 's=OPCUA_VARS/iWatchDog',
            dataType: "Integer",
            value: {
                get: function () {
                    return new opcua.Variant({dataType: opcua.DataType.Double, value: variable1 })
                }
            }
        })


        let variable2 = false;

        namespace.addVariable({
            componentOf: device,
            browseName: "bAuto",
            dataType: "Boolean",
            value: {
                get: () => new opcua.Variant({dataType: opcua.DataType.Double, value: variable2}),
                set: (variant) => {
                    variable2 = !!variant.value
                    return opcua.StatusCodes.Good
                }
            }
        })


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
        });

        server.start(function() {
            console.log("OPC Server is now listening ... ( press CTRL+C to stop)");
            console.log("port ", server.endpoints[0].port);
            const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
            console.log(" the primary server endpoint url is ", endpointUrl );
        });


    })
    return server
}
