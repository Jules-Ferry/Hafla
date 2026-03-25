const express = require("express")
const router = express.Router()
const userService = require("../services/userService")
const { DefaultError } = require("../errors/errors")

router.get("/login", async (req, res) => {
    const redirectUri = userService.generateOAuth2Link()
    return res.status(200).redirect(redirectUri)
})

router.get("/callback", async (req, res) => {
    const { code } = req.query
    if (!code) {
        throw new DefaultError(400, "Missing code / Auth canceled")
    }
    const profile = await userService.fetchExternalProvider(code)
    const user = await userService.checkIfUserIsInDb(profile.mail)
    req.session.user = user
    return res.status(200).json(user)
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