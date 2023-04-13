const db = require("../models")
const { Op } = require("sequelize")
const Notification = db.Notification
const { v4: uuidv4 } = require('uuid')
const { tryCatch } = require("./tryCatch")
const AppError = require("../middleware/AppError")
const { ALREADY_CREATE } = require("../middleware/errorCodes")

exports.createNotification = tryCatch(async(notificationTitle, message, emisorSocketId, receptorSocketId, createdTime) => {
    const notificationData = {
        _id: uuidv4(),
        notificationTitle,
        message,
        emisorSocketId,
        receptorSocketId,
        receptorRole,
        active: true
    }
    
    const notificación = await Notification.findOne({
        where: {
            [Op.and]: [{ emisorSocketId }, { createdAt: createdTime }]
        }
    })

    if (notificación){
        throw new AppError(ALREADY_CREATE, "Notificación ya creada", 400)
        // return {
        //     isError: true,
        //     name: "alreadyCreated",
        //     message: "Notificación ya creada"
        // }
    }

    return Notification.create(notificationData)
    .then(notification => {
        return notification
    }).catch(err => {
        return err
    })
})

exports.getAll = () => {
    return Notification.findAll()
}

exports.getByReceptor = (receptor) => {
    return Notification.findAll({
        where: { receptor }
    })
}

exports.getByReceptorRole = (receptorRole) => {
    return Notification.findAll({
        where: { receptorRole: {
            [Op.eq]: receptorRole
        } }
    })
}

exports.getByEmisor = (emisorId) => {
    return Notification.findAll({
        where: { emisor: emisorId }
    })
}

exports.deleteNotification = (id) => {
    return Notification.destroy({ where: { _id: id } }).then(num => {
        if (num == 1) return { isError: false }
        return { isError: true, name: 'dataNoDeleted' }
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError',
            message: "Error de servidor"
        }
    })
}