const Database = require("better-sqlite3")
const path = require("node:path")

const members = new Database(path.join(process.cwd(), "/data/members.db"))
members.pragma("journal_mode = WAL")

const hafla = new Database(path.join(process.cwd(), "/data/hafla.db"))
hafla.pragma("journal_mode = WAL")

module.exports = {
    members,
    hafla
}