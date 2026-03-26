const express = require("express")
const router = express.Router()
const path = require("node:path")
const fileService = require("../services/fileService")
const wwwroot = path.join(process.cwd(), "www")

router.get(/.*/, async (req, res, next) => {
    const filePath = req.originalUrl == "/" ? "index.html" : req.originalUrl
    try {
        const fileData = await fileService.serveFile(wwwroot, filePath)
        return res.status(200).sendFile(fileData)
    } catch (error) {
        next()
    }
})

module.exports = router