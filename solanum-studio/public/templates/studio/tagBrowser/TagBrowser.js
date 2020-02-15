import Template from "/lib/template.js"
import Label from "/templates/forms/Label.js"
import Tree from "/templates/treeView/Tree.js"

class TagBrowser extends Template {

    static styles = {
        'overflow': 'scroll'
    }

    children = {
        tree: new Tree({
            parent: this,
            position: {left: '0px', right: '0px', top: '0px'},
        })
    }

    constructor(args) {
        super(args)
        this.init()
        //this.loadTags()
    }

    async loadTags() {
        let response = await fetch('/API/studio/getTagPaths', {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'same-origin', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
        })
        let tagpaths = await response.json()
    }
}

export default TagBrowser