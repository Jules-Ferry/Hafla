const express = require("express")
const router = express.Router()
const hafla = require("../../../../services/haflaService")
const { DefaultError } = require("../../../../errors/errors")

const ADMIN_ROLES = ["CVL", "CPE", "AED"]

router.use((req, res, next) => {
    if (!req.session.user) {
        throw new DefaultError(401, "Not connected", "", "LoginNeededException")
    }
    if (!ADMIN_ROLES.includes(req.session.user.role)) {
        throw new DefaultError(403, "Missing permission", "", "PermissionException")
    }
    return next()
})

router.put("/:memberId", async (req, res) => {
    const { memberId } = req.params
    await hafla.registerStudent(memberId)
    
    return res.status(201).send()
})

router.delete("/:memberId", async (req, res) => {
    const { memberId } = req.params
    await hafla.unregisterStudent(memberId)
    
    return res.status(200).send()
})

router.get("/:memberId", async (req, res) => {
    const { memberId } = req.params
    const status = await hafla.getStudentStatus(memberId)
    
    return res.json(status)
})

router.get("/:memberId/ticket", async (req, res) => {
    const { memberId } = req.params
    const status = await hafla.getStudentStatus(memberId)

    if (!status.isRegistered) {
        throw new DefaultError(404, "Ticket not found", "Not registered", "NotFoundException")
    }

    const user = await hafla.getUserById(memberId)
    console.log(user)

    return res.json({
        memberId: parseInt(memberId),
        fullName: `${user.first_name} ${user.last_name}`,
        hasPaid: status.hasPaid,
        registeredAt: status.registeredAt
    })
})

module.exports = router