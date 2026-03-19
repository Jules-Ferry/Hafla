const fs = require("node:fs")
const path = require("node:path")
const DefaultError = require("../errors/DefaultError")

const fileDir = path.join(process.cwd(), "data", "static")

async function serveFile(url) {
    const filePath = path.join(fileDir, decodeURIComponent(url))
    try {
        await fs.promises.access(filePath, fs.constants.F_OK)
        return filePath
    } catch (error) {
        throw new DefaultError(404, "File not found")
    }
}

async function getFileData(url) {
    const filePath = path.join(fileDir, decodeURIComponent(url))
    try {
        await fs.promises.access(filePath, fs.constants.F_OK)
        return await fs.promises.readFile(filePath)
    } catch (error) {
        throw new DefaultError(404, "File not found")
    }
}

module.exports = {
    serveFile,
    getFileData
}