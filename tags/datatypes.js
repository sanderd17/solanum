let datatypes = {
        ST_MOTOR: {
                params: ["OPCUA", "motorId", "ns"],
                tagTree: {
                        fSpeed: {
                            type: "OpcTag",
                            ns: "{ns}",
                            OpcServer: "OPCUA",
                            nodeId: "OPC.Motors.{motorId}.fSpeed",
                            defaultValue: 0,
                        },
                        Info: {
                                type: "Folder",
                                tagTree: {
                                        Name: {
                                                type: "Memory",
                                                defaultValue: "Motor {motorId}",
                                        }
                                }
                        }
                }
        }
}

module.export = datatypes
