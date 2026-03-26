function navigateTo(url) {
    location.href = url
}

function initNavBar() {
    const buttons = document.querySelectorAll("nav > section > button")
    for (const button of buttons) {
        const page = button.getAttribute("page")
        if (page) {
            button.addEventListener("click", () => {
                navigateTo(page)
            })
        }
    }
}

initNavBar()