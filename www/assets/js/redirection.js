function getJsonFromUrl() {
    const url = location.search
    var query = url.substr(1)
    var result = {}
    query.split("&").forEach((part) => {
        var item = part.split("=")
        result[item[0]] = decodeURIComponent(item[1])
    })
    return result
}
const params = getJsonFromUrl()

document.querySelector("a").setAttribute("href", `/${params.state}`)
document.location.href = `/${params.state}`