const { hafla } = require("./database")

function initHafla() {
    const sql = `
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER UNIQUE NOT NULL,
            has_paid INTEGER DEFAULT 0,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `
    hafla.exec(sql)
}

module.exports = {
    initHafla
}