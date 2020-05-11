import SQLiteDB from './utils/SQLiteDB.js'
/**
 * The tag historian keeps track of the changes that happen to tag code
 */
class TagHistorian {
    async init() {
        if (this.db)
            return
        // Create an anonymous DB to store tag history while this server is running
        // Long-term history should be maintained with version management
        this.db = new SQLiteDB()
        await this.db.connect('')
        // Create DB schema
        await this.db.run(`
            CREATE TABLE TagHistory (
                TagFile TEXT NOT NULL,
                TimeStamp TIMESTAMP CURRENT_TIMESTAMP,
                ChangeDetails TEXT NOT NULL,
                Code TEXT NOT NULL
            )`)
        // close the connection safely on shutdown
        process.on('SIGINT', () => this.db.close())
    }

    /**
     * Register a change to a tag file, store the patch and details to disk
     * @param {string} tagFile
     * @param {string} oldCode
     * @param {any} details
     */
    async registerChange(tagFile, oldCode, details){
        await this.init()
        await this.db.run(`
            INSERT INTO TagHistory
                (TagFile,    Code, ChangeDetails) VALUES
                (      ?,       ?,             ?)`,
                [tagFile, oldCode, JSON.stringify(details)])
    }

    /**
     * Get the most recent changes 
     * @param {string} tagFile 
     * @param {number} limit
     */
    async getChanges(tagFile, limit) {
        await this.init()
        let changes = await this.db.all(`
            SELECT ChangeDetails, rowid
            FROM TagHistory
            WHERE tagFile = ?
            ORDER BY rowid DESC
            LIMIT ?`,
            [tagFile, limit])

        let result = []
        for (let c of changes) {
            let change = JSON.parse(c.ChangeDetails)
            change.rowId = c.rowid
            result.push(change)
        }
        return result
    }

    /**
     * Get the code for tag file at a certain changeset
     * @param {string} tagFile 
     * @param {number} rowId 
     */
    async getHistoricalComponent(tagFile, rowId) {
        await this.init()
        let result = await this.db.get('SELECT Code FROM TagHistory WHERE rowId = ?', [rowId])
        // TODO, also compare module and component?
        if (!result)
            return null
        return result.Code
    }
}

export default TagHistorian