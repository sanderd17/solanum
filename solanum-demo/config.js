import path from 'path'
import { fileURLToPath } from 'url'
import opcua from "node-opcua"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// TODO load different configs based on cli arguments

const config = {
    app: {
        port: 8840,
    },
    publicDirs: [
        path.join(__dirname, 'public/'),
        path.join(__dirname, '../solanum-core/public/'),
        path.join(__dirname, '../solanum-studio/public/'),
    ],
    editableDirs: {
        "main": path.join(__dirname, 'public/templates/'),
        "core": path.join(__dirname, '../solanum-core/public/templates/'),
        "studio": path.join(__dirname, '../solanum-studio/public/templates/'),
    },
    tags: {
        files: [
            path.join(__dirname, 'tags/default.js'),
        ]
    },
    opcua: {
        servers: [
            {
                name: 'DemoServer',
                description: 'Connection to the Demo Server',
                endpoint: 'opc.tcp://localhost:4334',
                options: {
                    applicationName: "MyClient",
                    connectionStrategy: {
                        initialDelay: 1000,
                        //maxRetry: 1, // By default, the OPC UA library will try to keep connecting
                    },
                    securityMode: opcua.MessageSecurityMode.None,
                    securityPolicy: opcua.SecurityPolicy.None,
                    endpoint_must_exist: false,
                }
            },
        ],
        subscriptions: [
            {
                name: 'default',
                options: {
                    requestedPublishingInterval: 1000,
                    requestedLifetimeCount:      100,
                    requestedMaxKeepAliveCount:   10,
                    maxNotificationsPerPublish:  100,
                    publishingEnabled: true,
                    priority: 10
                },
            },
        ],
    },
}

export default config
