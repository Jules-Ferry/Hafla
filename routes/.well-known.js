const express = require("express")
const router = express.Router()
const fileService = require("../services/fileService")

router.get(/.*/, async (req, res) => {
    const filePath = req.originalUrl
    const fileData = await fileService.getFileData(filePath)
    return res.status(200).end(fileData)
})

module.exports = router