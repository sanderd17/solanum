
class TagAPI {
    constructor(app, config) {
        this.app = app
        this.config = config
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