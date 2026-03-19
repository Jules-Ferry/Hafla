class DefaultError extends Error {
    constructor(code, message, cause, name) {
        super(message)
        this.code = code || 500
        this.name = name || "DefaultError"
        this.cause = cause || "Internal Server Error"
        this.message = message || "Internal Server Error"
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }

    serialize() {
        return {
            code: this.code,
            message: this.message
        }
    }
}

module.exports = DefaultError