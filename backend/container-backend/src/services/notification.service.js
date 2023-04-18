const db = require("../models")
const { Op } = require("sequelize")
const Notification = db.Notification
const { v4: uuidv4 } = require('uuid')
const { ALREADY_CREATE, SERVER_ERROR, MISSING_DATA } = require("../middleware/errorCodes")

exports.createNotification = async(notification) => {
    const notificationData = { _id: uuidv4(), ...notification }

    if (notificationData.notificationTitle != 'notifyRoleChanged') {
        const notificación = await Notification.findOne({
            where: {
                [Op.and]: [{ emisorId: notificationData.emisorId }, { notificationTitle: notificationData.notificationTitle }]
            }
        })
    
        if (notificación) return {
            isError: true,
            errorCode: ALREADY_CREATE,
            details: "Notificación ya creada",
            statusCode: 400,
        }
    }

    return Notification.create(notificationData)
    .then(notification => {
        return notification
    }).catch(err => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500
        }
    })
}

exports.changeActive = async (notificationId) => {
    if (!notificationId) return {
        isError: true,
        errorCode: MISSING_DATA,
        details: "NotificationId es necesaria",
        statusCode: 400,
    }

    return Notification.update({ active: 0 }, { where: { _id: notificationId } })
    .then(num => {
        if (num == 1)
            return { isError: false }

        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: "No se pudo actualizar",
            statusCode: 400,
        }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })

}

exports.getAll = () => {
    return Notification.findAll()
}

exports.getByReceptorId = (receptorId) => {
    if (!receptorId) return {
        isError: true,
        errorCode: MISSING_DATA,
        details: 'receptorId es requerido',
        statusCode: 404,
    }

    return Notification.findAll({
        where: { receptorId }
    })
}

exports.getByReceptorRole = (receptorRol) => {
    if (!receptorRol) return {
        isError: true,
        errorCode: MISSING_DATA,
        details: 'receptorRol es requerido',
        statusCode: 404,
    }

    return Notification.findAll({
        where: { receptorRol: { [Op.eq]: receptorRol } }
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
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500
        }
    })
}