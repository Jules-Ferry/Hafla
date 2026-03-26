const express = require("express")
const router = express.Router()
const path = require("node:path")
const fileService = require("../services/fileService")
const wwwroot = path.join(process.cwd(), "www")

router.use((req, res, next) => {
    if (!req.session.user) {
        throw new DefaultError(401, "Not connected", "", "LoginNeededException")
    }
    return next()
})

router.get("/", async (req, res) => {
    const file = await fileService.serveFile(wwwroot, "student.html")
    return res.sendFile(file)
})

module.exports = router