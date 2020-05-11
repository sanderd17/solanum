import sqlite3 from 'sqlite3'
/**
 * Promisified SQLite connection
 */
class SQLiteDB {
    connect(connectionString) {
        sqlite3.verbose()
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(connectionString, (err) => {
                if (err) {
                    throw err
                }
                return resolve()
            })
        })
    }

    serialize() {
        return new Promise((resolve) => {
            this.db.serialize(() => resolve())
        })
    }

    get(query, values = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, values, (err, row) => {
                if (err) {
                    throw err
                }
                return resolve(row)
            })
        })
    }

    all(query, values = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, values, (err, rows) => {
                if (err) {
                    throw err
                }
                return resolve(rows)
            })
        })
    }

    run(query, values = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, values, (err) => {
                if (err) {
                    throw err
                }
                return resolve()
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    throw err
                }
                return resolve()
            })
        })
    }
}

export default SQLiteDB