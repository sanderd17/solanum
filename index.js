// @ts-ignore -- wait until node has native es6 modules
require = require("esm")(module/*, options*/)
module.exports = require("./server/index.js")
