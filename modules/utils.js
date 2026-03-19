const logger = require("./logger")

function sendValidationError(req, res, zodResult, type, path, errorConfig) {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress 
    logger.warn(`Validation failed for ${req.method.cyan} ${path.cyan.bold} (${type}) ` + `<IP:${ip}>`.bold, ["WEB", "yellow"])

    const response = {
        success: false,
        message: errorConfig.message || `Validation failed in ${type}`,
        errors: zodResult.error.issues.map(e => ({ 
            field: e.path.join("."), 
            message: e.message 
        }))
    }

    if (errorConfig) {
        const extras = { ...errorConfig }
        delete extras.status
        delete extras.message
        Object.assign(response, extras)
    }

    return res.status(errorConfig.status || 400).json(response)
}

function isTrueFromDotEnv(key) {
    return (process.env[key] || "").trim().toLowerCase() === "true"
}

module.exports = {
    sendValidationError,
    isTrueFromDotEnv
}