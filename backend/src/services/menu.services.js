const { v4: uuidv4 } = require('uuid')
const db = require('../models')
const { MISSING_DATA, INFO_NOT_FOUND, SERVER_ERROR, INVALID_DATA } = require('../middleware/errorCodes')
const User = db.User
const Menu = db.Menu
const Menu_User = db.Menu_User

exports.createMenu = async (menuPrincipal, menuSecundario, date) => {
    if (!menuPrincipal) {
        return {
            isError: true,
            name: "missingData",
            errorCode: MISSING_DATA,
            details: "Name es requerido",
            statusCode: 404,
        }
    }
    if (!date) {
        return {
            isError: true,
            name: "missingData",
            errorCode: MISSING_DATA,
            details: "Fecha es requerido",
            statusCode: 404,
        }
    }
    const dataDate = new Date(date).setHours(12)

    if (+dataDate <= +new Date()) {
        return {
            isError: true,
            name: "invalidDate",
            errorCode: INVALID_DATA,
            details: 'Fecha erronea',
            statusCode: 404,
        }
    }
    
    const menuData = {
        _id: uuidv4(),
        menuPrincipal,
        menuSecundario,
        date: dataDate
    }

    const menu = await Menu.findOne({ where: { date } })
    if (menu) {
        return {
            isError: true,
            errorCode: ALREADY_CREATE,
            details: "Solo es posible registrar un menu por fecha",
            statusCode: 400
        }
    }

    return Menu.create(menuData).then(data => {
        return {
            isError: false,
            data
        }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500
        }
    })
}

exports.getAllMenu = () => {
    return Menu.findAll({
        include: { 
            model: User,
            attributes: ['_id', 'name', 'email', 'surName', 'rol'],
            through: {
                attributes: ['selectedMenu', 'entryDate']
            }
        }
    })
}

exports.getUsersOfMenu = (id) => {
    if (!id) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Id es requerida []',
            statusCode: 404,
        }
    }

    return Menu.findOne({ 
        where: { _id: id },
        include: { model: User }
    }).then(data => {
        if (!data) {
            return {
                isError: true,
                errorCode: INFO_NOT_FOUND,
                details: `Menu no encontrado [${id}]`,
                statusCode: 404,
            }
        }
        return { data, isError: false }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}

exports.getMenuByMenuId = (id) => {
    if (!id) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Id es requerida []',
            statusCode: 404,
        }
    }
    return Menu.findByPk(id, { include: { model: User } }).then(data => {
        if (!data) {
            return {
                isError: true,
                errorCode: INFO_NOT_FOUND,
                details: `Menu no encontrado [${id}]`,
                statusCode: 404,
            }
        }
        return { data, isError: false }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500
        }
    })
}

exports.getMenusByUserId = (userId) => {
    if (!userId) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'userId es requerida []',
            statusCode: 404,
        }
    }
    return Menu.findAll({
        include: {
            model: Menu_User,
            required: true,
            where: { userId },
        }
    }).then(data => {
        if (!data) {
            return {
                isError: true,
                errorCode: INFO_NOT_FOUND,
                details: `Menu no encontrado [${id}]`,
                statusCode: 404,
            }
        }
        return { data, isError: false }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500
        }
    })
}

// CAMBIAR SISTEMA DE OBTENCION Y ACTUALIZACION DE MENUS
// server:loadMenu sirva para que cada cliente solicite los menus de su mes
exports.getMenusOfMonth = (month) => {
    if (!month) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Mes es requerido',
            statusCode: 404,
        }
    }
    return Menu.findAll({ 
        where: { 
            date: db.Sequelize.where(db.Sequelize.fn('MONTH', db.Sequelize.col('date')), month)
        },
        include: { 
            model: User,
            attributes: ['_id', 'name', 'email', 'surName', 'rol'],
            through: {
                attributes: ['selectedMenu', 'entryDate']
            }
        }
    }).then(data => {
        if (!data) {
            return { 
                isError: true,
                errorCode: INFO_NOT_FOUND,
                details: `Menu no encontrado [${date}]`,
                statusCode: 404, 
            }
        }
        return { data, isError: false }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500 
        }
    })
}

exports.getMenuByDate = (date) => {
    if (!date) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Fecha es requerida',
            statusCode: 404,
        }
    }
    return Menu.findOne({ where: { date } }).then(data => {
        if (!data) {
            return { 
                isError: true,
                errorCode: INFO_NOT_FOUND,
                details: `Menu no encontrado [${date}]`,
                statusCode: 404, 
            }
        }
        return { data, isError: false }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500 
        }
    })
}

exports.updateMenu = (menu) => {
    if (!menu._id) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Id es requerida',
            statusCode: 404,
        }
    }
    return Menu.update(menu, { where: { _id: menu._id } }).then(num => {
        if (num == 1) {
            return { isError: false }
        }
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
            statusCode: 500
        }
    })
}

exports.deleteMenu = (id) => {
    if (!id) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Id es requerida',
            statusCode: 404,
        }
    }
    return Menu.destroy({ where: { _id: id }}).then(num => {
        if (num == 1) return { isError: false }
        return { 
            isError: true,
            errorCode: SERVER_ERROR,
            details: "No fue posible eliminar",
            statusCode: 401,
        } 
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500
        }
    })
}