import readdir from 'recursive-readdir'
import fs from 'fs'
import path from 'path'

class IconSet {
    /**
     * 
     * @param {string} baseDir 
     * @param {RegExp} regexMatch 
     */
    constructor(baseDir, regexMatch) {
        this.baseDir = baseDir
        this.regexMatch = regexMatch
    }

    async init() {
    }

    /**
     * @param {import('express').Request} req 
     * @param {import('express').Response} res 
     */
    getIcon(req, res) {
        // TODO make sure only files in the basedir can be queried 
        console.log(req.query)
        if (!req.query.iconPath.match(this.regexMatch)) {
            res.status(404)
            return
        }
        res.sendFile(path.join(this.baseDir, req.query.iconPath))
    }

    async getAllIcons() {
        let ret = {}
        let files = await readdir(this.baseDir)
        for (let f of files) {
            let match = f.match(this.regexMatch)
            if (match){
                ret[match[0]] = match.shift()
            }
        }

        return ret
    }
}


class IconManager {
    constructor() {
        /** @type {Map<string, IconSet>} */
        this.iconSets = new Map()
    }

    /**
     * 
     * @param {string} name 
     * @param {string} baseDir 
     * @param {RegExp} regexMatch 
     */
    async addIconSet(name, baseDir, regexMatch) {
        let iconSet = new IconSet(baseDir, regexMatch)
        await iconSet.init()
        this.iconSets.set(name, iconSet)
    }

    getIcon(req, res) {
        this.iconSets.get(req.query.iconSet).getIcon(req, res)
    }

    async getAllIcons(req, res) {
        let ret = {}
        for (let [key, iconSet] of this.iconSets.entries()) {
            ret[key] = await iconSet.getAllIcons()
        }
        res.send(ret)
    }
}

export default IconManager