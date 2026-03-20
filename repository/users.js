const db = require("../modules/database")

async function findMemberByEmail(email) {
    const stmt = db.members.prepare(`
        SELECT 
            m.email,
            m.last_name,
            m.first_name,
            g.name AS group_name,
            g.type AS group_type
        FROM members m
        JOIN groups g ON m.group_id = g.id
        WHERE m.email = ?
    `)

    return stmt.get(email)
}

module.exports = {
    findMemberByEmail
}