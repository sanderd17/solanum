interface ServerTag {
    value: object,
    tagPath?: string,
    quality?: string
}

interface ClientTag {
    value: object,
}

interface TagDescription {
    type: typeof ServerTag,
    defaultValue: object
}