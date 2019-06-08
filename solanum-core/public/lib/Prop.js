import ts from "./TagSet.js"
let exp = {}

export class Prop {
    constructor() {
        /** @type {Template?} template to which this prop was assigned */
        this.template = null
        /** @type {string?} id as which this prop was assigned */
        this.id = null
    }

    setContext(template, id) {
        this.template = template
        this.id = id
    }

    getValue() {
        throw new Error('`getValue` should be implemented by inheriting class')
    }

    /**
     * @param {any} value 
     */
    setValue(value) {
        throw new Error('`setValue` should be implemented by inheriting class')
    }
}

export class Raw extends Prop {
    constructor(value) {
        super()
        this.value = value
    }

    getValue() {
        return this.value
    }

    setValue(value) {
        let oldValue = this.value
        this.value = value
        this.template.handlePropChanged(this.id, value, oldValue)
    }
}
exp.Raw = (...args) => new Raw(...args)

export class Bound extends Prop {
    constructor(boundName, transform) {
        super()
        this.boundName = boundName
        this.transform = transform || (x => x)
    }

    getValue() {
        if (this.template.parent)
            return this.transform(this.template.parent.props[this.boundName])
        return null
    }

    // no setValue as it isn't possible to set this
}
exp.Bound = (...args) => new Bound(...args)

export class Tag extends Prop {
    constructor(tagPath) {
        super()
        this.tagPath = tagPath
        this.tagValue = null // tag value cache
        ts.addTagHandler(tagPath, this)
    }

    onTagChanged(tag) {
        let oldValue = this.tagValue
        this.tagValue = tag.value
        this.template.handlePropChanged(this.id, tag.value, oldValue)
    }

    getValue() {
        return this.tagValue
    }

    setValue(value) {
        ts.writeTag(this.tagPath, value)
    }
}
exp.Tag = (...args) => new Tag(...args)

// TODO BoundTagProps should react on binding change: unsubscribe from current tag path, and subscibe to new
export class BoundTag extends Prop {
    constructor(boundName, transform) {
        super()
        this.boundName = boundName
        this.transform = transform
        this.tagValue = null // tag value cache
    }

    setContext(template, id) {
        this.template = template
        this.id = id
        setTimeout(() => {
            // TODO get rid of timeout, but react on change from parent (like boundtag)
            this.tagPath = this.transform(this.template.parent.props[this.boundName])
            ts.addTagHandler(this.tagPath, this)
        })
    }

    onTagChanged(tag) {
        let oldValue = this.tagValue
        this.tagValue = tag.value
        this.template.handlePropChanged(this.id, tag.value, oldValue)
    }

    getValue() {
        return this.tagValue
    }

    setValue(value) {
        ts.writeTag(this.tagPath, value)
    }
}
exp.BoundTag = (...args) => new BoundTag(...args)

export default exp