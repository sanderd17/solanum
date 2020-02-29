import assert from 'assert'

import ComponentHistorian from '../../solanum-studio/server/ComponentHistorian.js'

export default async function({describe, it}) {
    await describe('Historian', async function() {
        await it('Should be able to store and retrieve history', async function() {
            let ch = new ComponentHistorian()
            await ch.registerChange('myModule', 'componentA', 'oldCode', {type: 'codeUpdate1'})
            await ch.registerChange('myModule', 'componentA', 'newCode', {type: 'codeUpdate2'})
            await ch.registerChange('myModule', 'componentA', 'newerCode', {type: 'codeUpdate3'})

            await ch.registerChange('myModule', 'componentB', 'oldCode', {type: 'codeUpdate4'})

            let changes = await ch.getChanges('myModule', 'componentA', 2)

            assert.equal(changes.length, 2)
            assert.equal(changes[0].type, 'codeUpdate3')
            assert.equal(changes[0].rowId, 3)
            assert.equal(changes[1].type, 'codeUpdate2')
            assert.equal(changes[1].rowId, 2)

            let code = await ch.getHistoricalComponent('myModule', 'componentA', 3)
            assert.equal(code, 'newerCode')
            code = await ch.getHistoricalComponent('myModule', 'componentA', 1)
            assert.equal(code, 'oldCode')
        })
    })
}
