
import fs from 'graceful-fs'
import util from 'util'
import steno from 'steno'

export const readFile = util.promisify(fs.readFile)
export const writeFile = util.promisify(steno.writeFile)
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let fileLocks = new Set()
const lockRetryTime = 10 //ms
const maxLockWaitTime = 5000 //ms

class File {
    /**
     * @param {string} filePath 
     */
    constructor(filePath) {
        this.filePath = filePath
        this.isRead = false
        this.isWritten = false
    }

    async waitUntilUnlocked() {
        let waitTime = 0
        while (fileLocks.has(this.filePath)) {
            if (waitTime > maxLockWaitTime)
                throw new Error(`Could not aquire lock for ${this.filePath} afer ${waitTime} ms`)
            await timeout(lockRetryTime)
            waitTime += lockRetryTime
        }
    }

    /**
     * Lock and open a file
     * @returns {Promise<string>} File contents
     * @throws {Error} When lock took too long to release, or content could not be read
     */
    async read() {
        if (this.isRead)
            throw new Error(`Error, file with path ${this.filePath} is being read twice`)
        this.isRead = true

        await this.waitUntilUnlocked()
        fileLocks.add(this.filePath)
        console.log(this.filePath)
        return await readFile(this.filePath, {encoding: 'utf-8'})
    }

    async read_NOLOCK() {
        return await readFile(this.filePath, {encoding: 'utf-8'})
    }

    async write(newCode) {
        if (this.isWritten)
            throw new Error(`Error, file with path ${this.filePath} is being written twice`)
        this.isWritten = true

        await writeFile(this.filePath, newCode)
        fileLocks.delete(this.filePath)
    }
}

export default File
