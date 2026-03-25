const haflaRepository = require("../repository/hafla")
const usersRepository = require("../repository/users")
const { DefaultError } = require("../errors/errors")

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

    if (paid) {
        return await haflaRepository.setAsPaid(memberId)
    } else {
        return await haflaRepository.setAsUnpaid(memberId)
    }
}

async function getStudentStatus(memberId) {
    const registration = await haflaRepository.getRegistration(memberId)
    return {
        isRegistered: !!registration,
        hasPaid: registration ? registration.has_paid === 1 : false,
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

module.exports = {
    registerStudent,
    toggleRegistration,
    updatePaymentStatus,
    getStudentStatus,
    unregisterStudent,
    getUserById
}