import path from 'path'

// TODO load different configs based on cli arguments

const config = {
    app: {
        port: 8840,
    },
    publicDirs: [
        path.join(__dirname, 'public/'),
        path.join(__dirname, 'solanum-core/public/'),
        path.join(__dirname, 'solanum-editor/public/'),
    ],
    editableDirs: {
        "main": path.join(__dirname, 'public/templates/'),
        "core": path.join(__dirname, 'solanum-core/public/templates/'),
        "editor": path.join(__dirname, 'solanum-editor/public/templates/'),
    },
    tags: {
        files: [
            path.join(__dirname, 'tags/default.js'),
        ]
    }
}

export default config
