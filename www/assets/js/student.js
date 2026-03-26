async function getSession() {
    const res = await fetch("/api/v1/session/me")
    const json = await res.json()
    return json
}

async function getStatus() {
    const res = await fetch("/api/v1/registration")
    const json = await res.json()
    return json
}

async function register() {
    const res = await fetch("/api/v1/registration", {
        method: "PUT"
    })
    return res.status
}

async function unRegister() {
    const res = await fetch("/api/v1/registration", {
        method: "DELETE"
    })
    return res.status
}

async function initStudent() {
    const session = await getSession()
    studentName.innerText = `${session.first_name} ${session.last_name}`
    group.innerText = `${session.group_name}`
}

async function initStatus() {
    const status = await getStatus()
    payment.innerText = status.hasPaid == true ? "Oui" : "En attente"
    registered.innerText = status.isRegistered == true ? "Oui" : "Non"
    action.innerText = status.isRegistered == true ? "Se désincrire" : "S'inscrire"
    action.removeAttribute("disabled")
    action.removeAttribute("title")
    action.removeAttribute("action")
    if (status.hasPaid == true) {
        action.setAttribute("disabled", "")
        action.setAttribute("title", "Une fois l'inscription payé, la désinscription doit s'effectuer en vie scolaire.")
    }
    if (status.isRegistered && !status.hasPaid) {
        action.setAttribute("action", "unregister")
    } else if (!status.isRegistered && !status.hasPaid) {
        action.setAttribute("action", "register")
    } else if (status.isRegistered && status.hasPaid) {
        action.setAttribute("action", "ticket")
    }
}

async function onMainButtonClick(action) {
    let result
    switch (action) {
        case "register":
            result = await register()
            break
        case "unregister":
            result = await unRegister()
            break
    
        default:
            break
    }
    await initStatus()
}

action.addEventListener("click", async () => {
    const $action = action.getAttribute("action")
    await onMainButtonClick($action)
})

initStudent()
initStatus()