const fs = require("node:fs")
const path = require("node:path")

function getRecursiveFiles(dir) {
    let results = []

    if (!fs.existsSync(dir)) {
        return results
    }

    const list = fs.readdirSync(dir)

    for (const file of list) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat && stat.isDirectory()) {
            results = results.concat(getRecursiveFiles(fullPath))
        } else {
            if (fullPath.endsWith(".js")) {
                results.push(fullPath)
            }
        }
    }

    return results
}

function computeRoutePath(baseDir, filePath) {
    const relativePath = path.relative(baseDir, filePath)
    let route = "/" + relativePath.split(path.sep).join("/")

    if (route.endsWith(".js")) {
        route = route.slice(0, -3)
    }
    if (route.endsWith("/index")) {
        route = route.slice(0, -6)
    }

    route = route.replace(/\[([^\]]+)\]/g, ":$1")

    if (route === "") {
        return "/"
    }

    return route
}

module.exports = {
    getRecursiveFiles,
    computeRoutePath
}