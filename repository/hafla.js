const { hafla } = require("../modules/database")

async function register(memberId) {
    const stmt = hafla.prepare(`INSERT INTO registrations (member_id) VALUES (?)`)
    return stmt.run(memberId)
}

async function unregister(memberId) {
    const stmt = hafla.prepare(`DELETE FROM registrations WHERE member_id = ?`)
    return stmt.run(memberId)
}

async function isRegistered(memberId) {
    const stmt = hafla.prepare(`SELECT 1 FROM registrations WHERE member_id = ?`)
    return !!stmt.get(memberId)
}

async function getRegistration(memberId) {
    const stmt = hafla.prepare(`SELECT * FROM registrations WHERE member_id = ?`)
    return stmt.get(memberId)
}

async function setAsPaid(memberId) {
    const stmt = hafla.prepare(`UPDATE registrations SET has_paid = 1 WHERE member_id = ?`)
    return stmt.run(memberId)
}

async function setAsUnpaid(memberId) {
    const stmt = hafla.prepare(`UPDATE registrations SET has_paid = 0 WHERE member_id = ?`)
    return stmt.run(memberId)
}

async function hasPaid(memberId) {
    const stmt = hafla.prepare(`SELECT has_paid FROM registrations WHERE member_id = ?`)
    const result = stmt.get(memberId)
    return result ? result.has_paid === 1 : false
}

async function getRegistrationCount() {
    const stmt = hafla.prepare(`SELECT COUNT(*) as count FROM registrations`)
    return stmt.get().count
}

async function setAsCheckedIn(memberId) {
    const stmt = hafla.prepare(`UPDATE registrations SET is_checked_in = 1 WHERE member_id = ?`)
    return stmt.run(memberId)
}

async function setAsUnCheckedIn(memberId) {
    const stmt = hafla.prepare(`UPDATE registrations SET is_checked_in = 0 WHERE member_id = ?`)
    return stmt.run(memberId)
}

module.exports = {
    hasPaid,
    register,
    setAsPaid,
    unregister,
    setAsUnpaid,
    isRegistered,
    setAsCheckedIn,
    getRegistration,
    setAsUnCheckedIn,
    getRegistrationCount
}