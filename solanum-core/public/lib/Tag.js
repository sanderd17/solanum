import ts from './TagSet.js';

export class Tag {

    /**
     * @param {Set<string>} readTags
     * @param {string[]} [tagpath]
     */
    constructor(readTags, tagpath) {
        this.readTags = readTags
        this.tagpath = tagpath || []
    }

    async read() {
        let tagpath = this.tagpath.join('.')
        this.readTags.add(tagpath)
        // Return a promise when found cached, or the value otherwise
        // in ts, resolve the promise when the value is received


        return await ts.readTag(tagpath)
    }

    async write(value) {
        // TODO implement write
    }
}

const proxyHandler = {
    get: (target, p) => {
        if (p == '__proto__') {
            return Object.getPrototypeOf(target)
        }
        if (p == 'read' || p == 'write') {
            return target[p].bind(target)
        }
        let subTag = new Tag(target.readTags, target.tagpath.concat([p]))
        return new Proxy(subTag, proxyHandler)
    },
    getPrototypeOf: (target) => Object.getPrototypeOf(target)
}

export const subscribedTags = new Set()
/**
 * Abstraction for tag handing
 * - async read() returns the value of a tag
 * - async write(v) writes the value of the tag and resolves when the write is confirmed
 * - Any other key drills down in the tag tree
 */
const tag = new Proxy(new Tag(subscribedTags), proxyHandler)
export default tag

window['tag'] = tag

/* Use like
await tag.default.motors.M1.color.read()
*/
