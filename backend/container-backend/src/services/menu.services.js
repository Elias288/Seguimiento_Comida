const { v4: uuidv4 } = require('uuid')
const db = require('../models')
const User = db.User
const Menu = db.Menu

exports.createMenu = async (menuPrincipal, menuSecundario, date) => {
    if (!menuPrincipal) {
        return {
            isError: true,
            name: "missingData",
            message: "Name es requerido"
        }
    }
    if (!date) {
        return {
            isError: true,
            name: "missingData",
            message: "Fecha es requerido"
        }
    }
    const dataDate = new Date(date)

    if (+dataDate <= +new Date()) {
        return {
            isError: true,
            name: "invalidDate"
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
            name: "alreadyCreated",
            message: "Solo es posible registrar un menu por fecha"
        }
    }

    return Menu.create(menuData).then(data => {
        return {
            isError: false,
            data
        }
    }).catch(error => {
        console.log(error)
        return {
            isError: true,
            name: "noDataError"
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
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
    return Menu.findOne({ 
        where: { _id: id },
        include: { model: User }
    }).then(data => {
        if (!data) {
            return { isError: true, name: 'notFound', message: 'Menu no encontrado' }
        }
        return { data, isError: false }
    }).catch(() => {
        return { isError: true, name: 'notDataError' }
    })
}

exports.getMenuById = (id) => {
    if (!id) {
        return {
            isError: true,
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
    return Menu.findByPk(id, { include: { model: User } }).then(data => {
        if (!data) {
            return {
                isError: true,
                name: 'notFound',
                message: 'Menu no encontrado'
            }
        }
        return { data, isError: false }
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.getMenuByDate = (date) => {
    if (!date) {
        return { isError: true, name: 'missingData', message: 'Fecha es requerido' }
    }
    return Menu.findOne({ where: { date } }).then(data => {
        if (!data) {
            return { isError: true, name: 'notFound', message: 'Menu no encontrado' }
        }
        return { data, isError: false }
    }).catch(() => {
        return { isError: true, name: 'notDataError' }
    })
}

exports.updateMenu = (menu) => {
    if (!menu._id) {
        return {
            isError: true,
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
    return Menu.update(menu, { where: { _id: menu._id } }).then(num => {
        if (num == 1) {
            return { isError: false }
        }
        return { isError: true, name: 'dataNotUpdated' }
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.deleteMenu = (id) => {
    if (!id) {
        return {
            isError: true,
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
    return Menu.destroy({ where: { _id: id }}).then(num => {
        if (num == 1) return { isError: false }
        return { isError: true, name: 'dataNoDeleted' } 
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}