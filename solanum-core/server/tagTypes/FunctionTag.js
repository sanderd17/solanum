import Tag from '../Tag.js'

class FunctionTag extends Tag{
    constructor(tagset, tagpath, data) {
        super(tagset, tagpath, data)

        this.value = 0
        if (data.pollRate) {
            setInterval(() => this.init(), data.pollRate)
        }
    }

    serialize() {
        return {
            value: this.value,
            tagpath: this.tagpath,
        }
    }

    async init() {
        this.value = await this.data.function()
        this.triggerChange()
    }

    triggerChange() {
        this.ts.triggerChange(this)
    }
}

export default FunctionTag