const jwt = require("jsonwebtoken")
const haflaRepository = require("../repository/hafla")
const usersRepository = require("../repository/users")
const { DefaultError } = require("../errors/errors")

const keysModule = require("../modules/keys")
const ticketKeys = keysModule.getKeys().ticket

async function getCurrentRegistrationCount() {
    return await haflaRepository.getRegistrationCount()
}

async function registerStudent(memberId) {
    const alreadyRegistered = await haflaRepository.isRegistered(memberId)
    if (alreadyRegistered) {
        throw new DefaultError(400, "Tu es déjà inscrit sur Hafla.", "AlreadyRegistered", "RegistrationException")
    }

    const count = await haflaRepository.getRegistrationCount() 
    if (count >= 200) {
        throw new DefaultError(403, "Désolé, l'événement est complet (200/200).", "EventFull", "QuotaException")
    }

    return await haflaRepository.register(memberId)
}

async function toggleRegistration(memberId) {
    const registered = await haflaRepository.isRegistered(memberId)
    
    if (registered) {
        await haflaRepository.unregister(memberId)
        return { status: "unregistered", message: "Inscription annulée." }
    } else {
        await registerStudent(memberId)
        return { status: "registered", message: "Inscription réussie !" }
    }
}

async function updatePaymentStatus(memberId, paid = true) {
    const registered = await haflaRepository.isRegistered(memberId)
    if (!registered) {
        throw new DefaultError(404, "L'élève n'est pas inscrit, il ne peut pas payer.", "NotRegistered", "PaymentException")
    }
    
    const studentStatus = await getStudentStatus(memberId)

    if (paid) {
        if (studentStatus.hasPaid) {
            throw new DefaultError(409, "Le payment à déjà été effectué", "DuplicatedPayment", "PaymentAlreadyDoneException")
        }
        return await haflaRepository.setAsPaid(memberId)
    } else {
        if (!studentStatus.hasPaid) {
            throw new DefaultError(409, "Le payment n'à jamais été effectué", "MissingPayment", "PaymentNotDoneException")
        }
        return await haflaRepository.setAsUnpaid(memberId)
    }
}

async function updateCheckedInStatus(memberId, checkedIn = true) {
    const registered = await haflaRepository.isRegistered(memberId)
    if (!registered) {
        throw new DefaultError(404, "L'élève n'est pas inscrit, il ne peut pas être coché comme présent.", "NotRegistered", "NotFoundExeption")
    }
    
    const studentStatus = await getStudentStatus(memberId)

    if (checkedIn) {
        if (studentStatus.isCheckedIn) {
            throw new DefaultError(409, "L'élève à déjà validé son billet", "DuplicatedTicketValidation", "AlreadyCheckedInException")
        }
        return await haflaRepository.setAsCheckedIn(memberId)
    } else {
        if (!studentStatus.isCheckedIn) {
            throw new DefaultError(409, "L'élève n'a pas validé son ticket'", "TicketNotValidated", "NotCheckedIn")
        }
        return await haflaRepository.setAsUnCheckedIn(memberId)
    }
}

async function getStudentStatus(memberId) {
    const registration = await haflaRepository.getRegistration(memberId)
    return {
        isRegistered: !!registration,
        hasPaid: registration ? registration.has_paid === 1 : false,
        isCheckedIn: registration ? registration.is_checked_in === 1 : false,
        registeredAt: registration ? registration.registered_at : null
    }
}

async function unregisterStudent(memberId) {
    const registered = await haflaRepository.isRegistered(memberId)
    if (!registered) {
        throw new DefaultError(404, "Impossible de se désinscrire : aucune réservation trouvée.", "NotRegistered", "RegistrationException")
    }
    const paid = await haflaRepository.hasPaid(memberId)
    if (paid) {
        throw new DefaultError(403, "Tu as déjà payé ta place. Contacte le CVL pour un remboursement et désinscription.", "AlreadyPaid", "PaymentException")
    }
    return await haflaRepository.unregister(memberId)
}

async function getUserById(id) {
    const user = await usersRepository.findMemberById(id)
    if (!user) {
        throw new DefaultError(404, "L'élève n'est pas présent sur le registre")
    }
    return user
}

async function getRegistrations(filters = { hasPaid, isCheckedIn }) {
    const registrations = await haflaRepository.getRegistrations(filters)
    const registry = await Promise.all(
        registrations.map(async (reg) => {
            try {
                const user = await usersRepository.findMemberById(reg.member_id);

                if (!user) {
                    return {
                        ...reg,
                        user: { last_name: "Inconnu", first_name: "Élève supprimé", group_name: "N/A" }
                    }
                }

                return {
                    ...reg,
                    user: user
                }
            } catch (error) {
                return { ...reg, user: null, error: "Erreur récupération" }
            }
        })
    )

    return registry
}

async function generateTicket(memberId) {
    const registered = await haflaRepository.isRegistered(memberId)
    if (!registered) {
        throw new DefaultError(404, "L'élève n'est pas inscrit, il ne peut pas avoir de ticket.", "NotRegistered", "NotFoundExeption")
    }
    
    const studentStatus = await getStudentStatus(memberId)
    if (!studentStatus.hasPaid) {
        throw new DefaultError(401, "L'élève n'a pas payé, il ne peut pas avoir de ticket.", "MissingPayment", "NotFoundExeption")
    }

    const student = await getUserById(memberId)

    const token = jwt.sign(student, ticketKeys.private, { issuer: "Hafla/0.0.1", expiresIn: "1y", algorithm: "RS256" })
    return token
}

async function checkTicketValidity(token) {
    try {
        const status = jwt.verify(token, ticketKeys.public, { issuer: "Hafla/0.0.1", ignoreExpiration: true, algorithms: ["RS256"] })
        return status
    } catch (error) {
        throw new DefaultError(400, "Token du ticket invalide !", "InvalidToken", "BadTokenException")
    }
}

module.exports = {
    getUserById,
    generateTicket,
    registerStudent,
    getRegistrations,
    getStudentStatus,
    unregisterStudent,
    toggleRegistration,
    updatePaymentStatus,
    checkTicketValidity,
    updateCheckedInStatus,
    getCurrentRegistrationCount
}