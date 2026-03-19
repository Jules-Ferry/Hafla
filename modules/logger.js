const fs = require("node:fs")
const path = require("node:path")
require("colors")
require("dotenv").config({
    quiet: true
})

function cleanup($stream) {
    if (!$stream.destroyed) {
        $stream.end()
    }
}

function write($stream, level, color, content, extraLabels = []) {
    const date = new Date().toISOString()
    const message = typeof content === "string" ? content : JSON.stringify(content, null, 2)

    let consoleLabels = ""
    let fileLabels = ""

    if (Array.isArray(extraLabels) && extraLabels.length > 0) {
        for (let i = 0; i < extraLabels.length; i += 2) {
            const labelName = extraLabels[i]
            const labelColor = extraLabels[i + 1]
            if (labelName) {
                fileLabels += ` [${labelName}]`
                if (labelColor && labelName[labelColor]) {
                    consoleLabels += ` [${labelName[labelColor]}]`
                } else {
                    consoleLabels += ` [${labelName.white}]`
                }
            }
        }
    }

    // eslint-disable-next-line no-console
    console.log(`[${date}] `.magenta + `[${level}]`[color] + consoleLabels + " " + message)
    $stream.write(`[${date}] [${level}]${fileLabels} ${stripColors(message)}\n`)
}

function createLogger(root) {
    // eslint-disable-next-line no-useless-escape
    const fileName = isTrueFromDotEnv("IS_PROD") ? new Date().toLocaleString("fr-FR", { timeZone: "UTC" }).replace(/[\/:]/g, "-").replace(/ /g, "_") : "DEV-LOG"

    const logsDir = path.join(root, "logs")

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
    }

    const stream = fs.createWriteStream(path.join(logsDir, `${fileName}.log`), { flags: "a" })

    process.on("exit", () => {
        cleanup(stream)
    })

    process.on("SIGINT", () => {
        cleanup(stream)
        process.exit()
    })

    return {
        log: (content, labels) => {
            write(stream, "INFO", "green", content, labels)
        },
        error: (content, labels) => {
            write(stream, "ERROR", "red", content, labels)
        },
        warn: (content, labels) => {
            write(stream, "WARN", "yellow", content, labels)
        },
        debug: (content, labels) => {
            write(stream, "DEBUG", "white", content, labels)
        }
    }
}

function stripColors(string) {
    if (!string || typeof string !== "string") {
        return string
    }
    // eslint-disable-next-line no-control-regex
    return string.replace(/\x1B\[[0-9;]*[mK]/g, "")
}

function isTrueFromDotEnv(key) {
    return (process.env[key] || "").trim().toLowerCase() === "true"
}

const logger = createLogger(process.cwd())

module.exports = logger