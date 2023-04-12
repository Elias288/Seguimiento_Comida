const db = require("../models")
const { Op } = require("sequelize")
const Notification = db.Notification
const { v4: uuidv4 } = require('uuid')

exports.createNotification = async(name, message, emisor, receptor, receptorRole) => {
    const notificationData = {
        _id: uuidv4(),
        name,
        message,
        emisor,
        receptor,
        receptorRole,
        active: true
    }
    
    const notificación = await Notification.findOne({
        where: {
            [Op.and]: [{ name }, {
                [Op.and]: [{ message }, { emisor }]
            }]
        }
    })

    if (notificación){
        return {
            isError: true,
            name: "alreadyCreated",
            message: "Notificación ya creada"
        }
    }

    return Notification.create(notificationData)
    .then(notification => {
        return { isError: false, notification }
    }).catch(err => {
        console.log(err);
        return {
            isError: true,
            name: 'noDataError',
            message: "Error de servidor"
        }
    })
}

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