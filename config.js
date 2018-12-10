import path from 'path'

// TODO load different configs based on cli arguments

const config = {
    app: {
        port: 8840,
    },
    publicDirs: [
        path.join(__dirname, 'public'),
        path.join(__dirname, 'solanum-core/public'),
        path.join(__dirname, 'solanum-editor/public'),
    ],
    tags: {
        files: [
            path.join(__dirname, 'tags/default.js'),
        ]
    }
}

export default config
