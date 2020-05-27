import CustomTagType from 'solanum-core/server/tagTypes/CustomTagType.js'
import MemoryTag from 'solanum-core/server/MemoryTag.js'

class ST_Motor extends CustomTagType {

    static parameters = [
        {
            name: "sId",
            description: "Motor id",
            type: "String",
        }   
    ]

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
                defaultValue: `hsl(${(data.sId.match(/[0-9]+/)[0]) % 360}, 100%, 50%)`,
            })
        })
    }
}

export default ST_Motor