// @ts-nocheck
import assert from 'assert'

import ClientConnection from '../../solanum-core/server/ClientConnection.js'

let dummyWebSocket = (expectedTypes) => ({
    'on': (type, fn) => {
        assert(expectedTypes.includes(type))

    }
})
export default function({describe, it}) {
    describe('constructor', function() {
        it('constructs', function() {
            let ip = "ip"
            let ws = dummyWebSocket(['message'])
            let cl = new ClientConnection(ws, ip)

            assert.equal(cl.ws, ws)
            assert.equal(cl.ip, ip)
            assert.equal(cl.pingTimerId, null)
            assert.deepEqual(ClientConnection.messageTypes, {})
        })
    }),
    describe('initPing', function() {
        it('creates a ping interval timer', function () {
            let ip = "ip"
            let cl = new ClientConnection(dummyWebSocket(['message', 'pong']), ip)

            cl.initPing()

            assert(cl.pingTimerId != null)
            clearInterval(cl.pingTimerId)
        })
    }),
    describe('on', function() {
        it('adds a message handling function', function () {
            let fn = (msg, client) => assert.fail() // should not be executed
            ClientConnection.on('testHandler', fn)
            assert.equal(ClientConnection.messageTypes.testHandler[0], fn)
        })
    }),
    describe('sendMessage', function() {
        it('sends a message', function () {
            let ip = "ip"
            let cl1 = new ClientConnection(dummyWebSocket(['message']), ip)
            let cl2 = new ClientConnection(dummyWebSocket(['message']), ip)
            let execCount = 0
            let fn = (client, msg) => {
                execCount++
                assert.equal(msg, 'testMessage')
                assert.equal(client, cl1)
            }
            ClientConnection.on('test:Handle', fn)

            cl1.handleMessage({'test:Handle': 'testMessage'})
            assert.equal(execCount, 1)
            cl1.handleMessage({'test:Handle': 'testMessage'})
            assert.equal(execCount, 2)
        })
    })
}
