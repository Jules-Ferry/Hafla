const express = require("express")
const router = express.Router()
const userService = require("../services/userService")
const { DefaultError } = require("../errors/errors")
const path = require("node:path")
const fileService = require("../services/fileService")
const wwwroot = path.join(process.cwd(), "www")

router.get("/login", async (req, res) => {
    const { redirect } = req.query
    let state = null
    if (redirect && ["/admin", "/student"].includes(redirect)) {
        state = redirect.replace("/", "")
    }
    const redirectUri = userService.generateOAuth2Link(state)
    return res.status(200).redirect(redirectUri)
})

router.get("/callback", async (req, res) => {
    const { code, state } = req.query
    const file = await fileService.serveFile(wwwroot, "redirect.html")
    if (!code) {
        throw new DefaultError(400, "Missing code / Auth canceled")
    }
    const profile = await userService.fetchExternalProvider(code)
    const user = await userService.checkIfUserIsInDb(profile.mail)
    req.session.user = user
    if (!state) {
        return res.status(200).json(user)
    }
    return res.sendFile(file)
})

router.get("/logout", async (req, res) => {
    req.session.destroy(async (err) => {
        if (err) throw err
        
        res.clearCookie("connect.sid")
        return res.redirect(`${req.originalUrl}/post`)
    })
})

router.get("/logout/post", async (req, res) => {
    return res.status(200).send("Disconnected!")
})

module.exports = router