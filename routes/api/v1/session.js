const express = require("express")
const { DefaultError } = require("../../../errors/errors")
const router = express.Router()

router.get("/me", async (req, res) => {
    if (req.session.user) {
        return res.status(200).json(req.session.user)
    }
    throw new DefaultError(401, "User not connected", "", "LoginNeededException")
})

module.exports = router