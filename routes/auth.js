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
    return res.status(200).json(profile)
})

module.exports = router