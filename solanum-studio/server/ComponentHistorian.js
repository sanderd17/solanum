import SQLiteDB from './utils/SQLiteDB.js'
/**
 * The component historian keeps track of the changes that happen to component code
 */
class ComponentHistorian {
    async init() {
        if (this.db)
            return
        // Create an anonymous DB to store component history while this server is running
        // Long-term history should be maintained with version management
        this.db = new SQLiteDB()
        await this.db.connect('')
        // Create DB schema
        await this.db.run(`
            CREATE TABLE ComponentHistory (
                Module TEXT NOT NULL,
                Component TEXT NOT NULL,
                TimeStamp TIMESTAMP CURRENT_TIMESTAMP,
                ChangeDetails TEXT NOT NULL,
                Code TEXT NOT NULL
            )`)
        // close the connection safely on shutdown
        process.on('SIGINT', () => this.db.close())
    }

    /**
     * Register a change to a component, store the patch and details to disk
     * @param {string} module
     * @param {string} component
     * @param {string} oldCode
     * @param {any} details
     */
    async registerChange(module, component, oldCode, details){
        await this.init()
        await this.db.run(`
            INSERT INTO ComponentHistory
                (Module, Component,    Code, ChangeDetails) VALUES
                (     ?,         ?,       ?,             ?)`,
                [module, component, oldCode, JSON.stringify(details)])
    }

    /**
     * Get the most recent changes 
     * @param {string} module 
     * @param {string} component 
     * @param {number} limit
     */
    async getChanges(module, component, limit) {
        await this.init()
        let changes = await this.db.all(`
            SELECT ChangeDetails, rowid
            FROM ComponentHistory
            WHERE Module = ? AND Component = ?
            ORDER BY rowid DESC
            LIMIT ?`,
            [module, component, limit])

        let result = []
        for (let c of changes) {
            let change = JSON.parse(c.ChangeDetails)
            change.rowId = c.rowid
            result.push(change)
        }
        return result
    }

    /**
     * Get the code for component at a certain changeset
     * @param {string} module 
     * @param {string} component 
     * @param {number} rowId 
     */
    async getHistoricalComponent(module, component, rowId) {
        await this.init()
        let result = await this.db.get('SELECT Code FROM ComponentHistory WHERE rowId = ?', [rowId])
        // TODO, also compare module and component?
        if (!result)
            return null
        return result.Code
    }
}

export default ComponentHistorian