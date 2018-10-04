import Tag from './Tag.js'
import ts from './TagSet.js'

const fs = require('fs')
const chokidar = require('chokidar')

function FileTag(tagPath, data) {
    this.tagPath = tagPath
    this.filePath = data.filePath
    this.value = null
    this.quality = 'INIT'

    /*fs.watch(this.filePath, 'utf-8', (eventType, fileName) => {
        console.log("FILE CHANGED")
        if (eventType == "change")
            this.triggerChange()
    })*/
    chokidar.watch(this.filePath).on('all', (event, path) => this.triggerChange())
}

FileTag.prototype = Object.create(Tag.prototype)

FileTag.prototype.triggerChange = function() {
    fs.readFile(this.filePath, 'utf-8', (err, data) => {

        if (err) {
            console.log(`Error reading tag file ${this.filePath}: ` + err)
            this.quality = 'ERR'
            this.value = null
            return
        }
        //console.log(data)
        this.value = data
        this.quality = 'GOOD'

        ts.triggerChange(this)
    })
}

FileTag.prototype.write = function(content) {
    
}

export default FileTag

