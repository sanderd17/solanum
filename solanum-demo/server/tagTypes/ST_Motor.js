import TagFolder from 'solanum-core/server/TagFolder.js'
import MemoryTag from 'solanum-core/server/MemoryTag.js'

class ST_Motor extends TagFolder {
    /**
     * @param {*} data 
     */
    constructor(data) {
        super({
            sId: new MemoryTag({
                defaultValue: data.sId
            }),
            bFwdMan: new MemoryTag({
                defaultValue: false
            }),
            bRvsMan: new MemoryTag({
                defaultValue: false
            }),
            sColor: new MemoryTag({
                defaultValue: `hsl(${(data.i) % 360}, 100%, 50%)`,
            })
        })
    }
}

export default ST_Motor