const express = require("express")
const router = express.Router()
const hafla = require("../../../services/haflaService")
const { DefaultError } = require("../../../errors/errors")

router.use((req, res, next) => {
    if (!req.session.user) {
        throw new DefaultError(401, "Not connected", "", "LoginNeededException")
    }
    return next()
})

router.put("/", async (req, res) => {
    const memberId = req.session.user.id
    await hafla.registerStudent(memberId)
    
    return res.status(201).json({ 
        success: true
    })
})

router.delete("/", async (req, res) => {
    const memberId = req.session.user.id
    await hafla.unregisterStudent(memberId)
    
    return res.json({ 
        success: true
    })
})

router.get("/", async (req, res) => {
    const memberId = req.session.user.id
    const status = await hafla.getStudentStatus(memberId)
    
    return res.json(status)
})

router.get("/ticket", async (req, res) => {
    const memberId = req.session.user.id
    const status = await hafla.getStudentStatus(memberId)

    if (!status.isRegistered) {
        throw new DefaultError(404, "Ticket not found", "Not registered", "NotFoundException")
    }

    return res.json({
        memberId: memberId,
        fullName: `${req.session.user.first_name} ${req.session.user.last_name}`,
        hasPaid: status.hasPaid,
        registeredAt: status.registeredAt
    })
})

module.exports = router