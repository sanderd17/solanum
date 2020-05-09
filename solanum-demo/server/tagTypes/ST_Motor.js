import TagFolder from 'solanum-core/server/TagFolder.js'
import MemoryTag from 'solanum-core/server/MemoryTag.js'

class ST_Motor extends TagFolder {
    constructor(data) {
        super({
            sId: {
                type: MemoryTag,
                defaultValue: data.sId
            },
            bFwdMan: {
                type: MemoryTag,
                defaultValue: false
            },
            bRvsMan: {
                type: MemoryTag,
                defaultValue: false
            },
            sColor: {
                type: MemoryTag,
                defaultValue: `hsl(${(data.i) % 360}, 100%, 50%)`,
            }
        })
    }
}

export default ST_Motor