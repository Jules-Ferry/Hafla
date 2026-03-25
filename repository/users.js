const db = require("../modules/database")

async function findMemberByEmail(email) {
    const stmt = db.members.prepare(`
        SELECT 
            m.id,
            m.email,
            m.last_name,
            m.first_name,
            g.name AS group_name,
            g.type AS group_type,
            r.name AS role
        FROM members m
        LEFT JOIN groups g ON m.group_id = g.id
        LEFT JOIN members_roles mr ON m.id = mr.member_id
        LEFT JOIN roles r ON mr.role_id = r.id
        WHERE m.email = ?
    `)

    return stmt.get(email)
}

async function findMemberById(id) {
    const stmt = db.members.prepare(`
        SELECT 
            m.id,
            m.email,
            m.last_name,
            m.first_name,
            g.name AS group_name,
            g.type AS group_type,
            r.name AS role
        FROM members m
        LEFT JOIN groups g ON m.group_id = g.id
        LEFT JOIN members_roles mr ON m.id = mr.member_id
        LEFT JOIN roles r ON mr.role_id = r.id
        WHERE m.id = ?
    `)

    return stmt.get(id)
}

module.exports = {
    findMemberByEmail,
    findMemberById
}