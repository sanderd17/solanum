const assert = require('assert')

import Client from '../src/Client.js'

let dummyWebSocket = (expectedTypes) => ({
    'on': (type, fn) => {
        assert(expectedTypes.includes(type))

    }
})
describe('Client', function() {
    describe('constructor', function() {
        it('constructs', function() {
            let ip = "ip"
            let ws = dummyWebSocket(['message'])
            let cl = new Client(ws, ip)

            assert.equal(cl.ws, ws)
            assert.equal(cl.ip, ip)
            assert.equal(cl.pingTimerId, 0)
            assert.equal(Client.messageTypes, null)
        })
    }),
    describe('initPing', function() {
        it('creates a ping interval timer', function () {
            let ip = "ip"
            let cl = new Client(dummyWebSocket(['message', 'pong']), ip)

            cl.initPing()

            assert(cl.pingTimerId != null)
            clearInterval(cl.pingTimerId)
        })
    }),
    describe('on', function() {
        it('adds a message handling function', function () {
            let fn = (msg, client) => assert.fail() // should never be executed
            Client.on('testHandler', fn)
            assert.equal(Client.messageTypes.testHandler, fn)
        })
    }),
    describe('sendMessage', function() {
        it('sends a message', function () {
            let ip = "ip"
            let cl1 = new Client(dummyWebSocket(['message']), ip)
            let cl2 = new Client(dummyWebSocket(['message']), ip)
            let execCount = 0
            let fn = (client, msg) => {
                execCount++
                assert.equal(msg, 'testMessage')
                assert.equal(client, cl1)
            }
            Client.on('test:Handle', fn)

            cl1.handleMessage({'test:Handle': 'testMessage'})
            assert.equal(execCount, 1)
            cl1.handleMessage({'test:Handle': 'testMessage'})
            assert.equal(execCount, 2)
        })
    })
})
