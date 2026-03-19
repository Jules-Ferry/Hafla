const express = require("express")
const hpp = require("hpp")
const app = express()
const cors = require("cors")
const path = require("node:path")
const utils = require("./modules/utils")
const logger = require("./modules/logger")
const helmet = require("helmet")
const loader = require("./modules/loader")
const DefaultError = require("./errors/DefaultError")
const path2regex = require("path-to-regexp")

const routes = loader.getRecursiveFiles(path.join(__dirname, "routes"))
const schemas = loader.getRecursiveFiles(path.join(__dirname, "schemas"))

const schemaRegistry = {}

app.use(hpp())
app.use(helmet())
app.use(cors({ origin: "*" }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set("trust proxy", true)

logger.log("Initializing routes", ["WEB", "yellow"])

for (const schemaFile of schemas) {
    try {
        const schemaConfig = require(schemaFile)
        const routePath = loader.computeRoutePath(path.join(__dirname, "schemas"), schemaFile)
        schemaRegistry[routePath] = schemaConfig

        logger.log(`${routePath.cyan.bold} schema loaded in memory`, ["WEB", "yellow"])
    } catch (error) {
        logger.error(error.toString(), ["WEB", "yellow"])
    }
}

app.all(/.*/, (req, res, next) => {
    let currentPath = req.path
    if (currentPath.length > 1 && currentPath.endsWith("/")) {
        currentPath = currentPath.slice(0, -1)
    }

    let schemaConfig = schemaRegistry[currentPath]
    let matchedParams = {}

    if (!schemaConfig) {
        const registeredRoutes = Object.keys(schemaRegistry)
        for (const routePattern of registeredRoutes) {
            if (!routePattern.includes(":")) {
                continue
            }

            const matcher = path2regex.match(routePattern, { decode: decodeURIComponent })
            const result = matcher(currentPath)

            if (result) {
                schemaConfig = schemaRegistry[routePattern]
                matchedParams = result.params
                break
            }
        }
    }

    if (!schemaConfig || !schemaConfig[req.method]) {
        return next()
    }

    req.params = { ...req.params, ...matchedParams }

    const methodConfig = schemaConfig[req.method]
    const errorConfig = methodConfig.error || { status: 400, message: "Validation Error" }

    if (methodConfig.headers) {
        const headerResult = methodConfig.headers.safeParse(req.headers)
        if (!headerResult.success) {
            return utils.sendValidationError(req, res, headerResult, "headers", currentPath, errorConfig)
        }
    }

    let dataSchema = null
    let dataToValidate = null
    let validationType = "body"

    if (req.method === "GET" || req.method === "DELETE") {
        dataSchema = methodConfig.query
        dataToValidate = req.query
        validationType = "query"
    } else {
        dataSchema = methodConfig.body
        dataToValidate = req.body
    }

    if (dataSchema) {
        const result = dataSchema.safeParse(dataToValidate)
        if (!result.success) {
            return utils.sendValidationError(req, res, result, validationType, currentPath, errorConfig)
        }
        if (validationType === "query") {
            req.query = result.data
        } else {
            req.body = result.data
        }
    }

    return next()
})

for (const route of routes) {
    try {
        const router = require(route)
        const routePath = loader.computeRoutePath(path.join(__dirname, "routes"), route)
        if (router.stack) {
            for (const layer of router.stack) {
                if (layer.route && layer.route.methods) {
                    const method = Object.keys(layer.route.methods).join(", ").toUpperCase()
                    const subPath = routePath === "/" ? "" : routePath
                    logger.log(`${method.cyan} ${subPath.cyan.bold} route registered`, ["WEB", "yellow"])
                }
            }
        }
        app.use(routePath, router)
    } catch (error) {
        logger.error(error.toString(), ["WEB", "yellow"])
    }
}

app.all(/.*/, (req, res, next) => {
    next(new DefaultError(404, `Can't find ${req.originalUrl} on this server!`, null, "NotFound"))
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500

    logger.error(err.message, ["API", "red"])

    if (typeof err.serialize === "function") {
        return res.status(statusCode).json(err.serialize())
    }

    return res.status(500).json({
        status: "error",
        message: "Internal Server Error"
    })
})

app.listen(process.env.WEB_PORT || 3000, () => {
    logger.log(`Server listening at port : ${process.env.WEB_PORT || 3000}`, ["WEB", "yellow"])
})