const express = require("express")
const hafla = require("../../../services/haflaService")
const router = express.Router()

router.get("/count", async (req, res) => {
    return res.status(200).json({
        max: 200,
        current: await hafla.getCurrentRegistrationCount()
    })
})

module.exports = router