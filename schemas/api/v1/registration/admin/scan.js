const z = require("zod")

module.exports = {
    POST: {
        headers: z.object({
            "content-type": z.string()
                .regex(/application\/json/i, { message: "Content-Type must be application/json" })
        }),
        body: z.object({
            token: z.string()
        })
    }
}