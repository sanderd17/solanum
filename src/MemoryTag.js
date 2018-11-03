import Tag from './Tag.js'
import ts from './TagSet.js'

const fs = require('fs')

function MemoryTag(tagPath, data) {
    this.tagPath = tagPath
    this.value = data.defaultValue
    this.quality = 'GOOD'
}

MemoryTag.prototype = Object.create(Tag.prototype)

MemoryTag.prototype.triggerChange = function() {
    ts.triggerChange(this)
}

MemoryTag.prototype.write = function(value) {
    this.value = value
    this.triggerChange()
}

export default MemoryTag

