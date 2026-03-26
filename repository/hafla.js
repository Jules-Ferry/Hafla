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


async function getRegistrations(filters = {}) {
    let sql = `SELECT * FROM registrations WHERE 1=1`
    const params = []

    if (filters.hasPaid !== undefined) {
        sql += ` AND has_paid = ?`
        params.push(filters.hasPaid ? 1 : 0)
    }

    if (filters.isCheckedIn !== undefined) {
        sql += ` AND is_checked_in = ?`
        params.push(filters.isCheckedIn ? 1 : 0)
    }

    sql += ` ORDER BY id DESC`

    const stmt = hafla.prepare(sql)
    return stmt.all(...params)
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
    getRegistrations,
    getRegistrationCount
}