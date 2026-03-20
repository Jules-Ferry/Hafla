const utils = require("../modules/utils")
const { DefaultError } = require("../errors/errors")
const usersRepository = require("../repository/users")

function getRedirectUrl() {
    if (utils.isTrueFromDotEnv(process.env.IS_PROD)) {
        return process.env.AZUR_PUBLIC_REDIRECT
    }
    return process.env.AZUR_LOCAL_REDIRECT
}

function generateOAuth2Link() {
    const params = new URLSearchParams()
    params.append("client_id", process.env.AZUR_CLIENT_ID)
    params.append("response_type", "code")
    params.append("redirect_uri", getRedirectUrl())
    params.append("scope", "openid profile email User.Read")
    params.append("response_mode", "query")
    params.append("nonce", "678910")
    params.append("prompt", "consent")
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
}

async function getMSTokens(code) {
    const params = new URLSearchParams()
    params.append("client_id", process.env.AZUR_CLIENT_ID)
    params.append("client_secret", process.env.AZUR_CLIENT_SECRET)
    params.append("code", code)
    params.append("redirect_uri", getRedirectUrl())
    params.append("grant_type", "authorization_code")
    const tokenResponse = await fetch(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
        method: "POST",
        body: params,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    const tokens = await tokenResponse.json()
    return tokens
}

async function getUserProfile(tokens) {
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`
        }
    })

    const profile = await userResponse.json()
    return profile
}

async function fetchExternalProvider(code) {
    const tokens = await getMSTokens(code)
    const profile = await getUserProfile(tokens)
    return profile
}

async function checkIfUserIsInDb(email) {
    const user = await usersRepository.findMemberByEmail(email)
    if (typeof user == "undefined") {
        throw new DefaultError(404, "Élève non inscrit dans le registre.", "E-Mail not registered", "MissingStudentException")
    }
    return user
}

async function registerStudent( ) {
    
}

module.exports = {
    generateOAuth2Link,
    fetchExternalProvider,
    checkIfUserIsInDb
}