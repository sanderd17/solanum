
class TagAPI {
    /**
     * 
     * @param {import('express').Application} app 
     * @param {*} config 
     * @param {import('../../solanum-core/server/TagSet').default} ts 
     */
    constructor(app, config, ts) {
        this.app = app
        this.config = config
        this.ts = ts
    }

    initMessageHandlers() {
        this.app.get('/API/Studio/getSubTags', (req, res) => {
            // get a list of tagpaths in the request
            // reply with the subtags per tagpath
            let tagpath = req.query.tagpath
            res.send([
                {
                    type: 'tag',
                    path: 'tp1',
                    name: 'tp1'
                },
                {
                    type: 'folder',
                    path: 'folder1',
                    name: 'folder1'
                },
            ])
        })
    }
}

export default TagAPI