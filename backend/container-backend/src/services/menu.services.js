const db = require('../models')
const User = db.User
const Menu = db.Menu

exports.getAllMenu = () => {
    return Menu.findAll({
        include: { model: User }
    })
}

exports.getUsersOfMenu = (id) => {
    if (!id) {
        console.error(new Error('Id no encontrada'))
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
            console.error(new Error('Menu no encontrado'))
            return { isError: true, name: 'notFound', message: 'Menu no encontrado' }
        }
        return { data, isError: false }
    }).catch(() => {
        console.error(new Error('Error recuperando los datos'))
        return { isError: true, name: 'notDataError' }
    })
}

exports.getMenuById = (id) => {
    if (!id) {
        console.error(new Error('Id no encontrada'))
        return {
            isError: true,
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
    return Menu.findByPk(id).then(data => {
        if (!data) {
            console.error(new Error('Menu no encontrado'))
            return {
                isError: true,
                name: 'notFound',
                message: 'Menu no encontrado'
            }
        }
        return { data, isError: false }
    }).catch(() => {
        console.error(new Error('Error recuperando los datos'))
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.getMenuByDate = (date) => {
    if (!date) {
        console.error(new Error('date no encontrada'))
        return { isError: true, name: 'missingData', message: 'Fecha es requerido' }
    }
    return Menu.findOne({ where: { date } }).then(data => {
        if (!data) {
            console.error(new Error('Menu no encontrado'))
            return { isError: true, name: 'notFound', message: 'Menu no encontrado' }
        }
        return { data, isError: false }
    }).catch(() => {
        console.error(new Error('Error recuperando los datos'))
        return { isError: true, name: 'notDataError' }
    })
}

exports.updateMenu = (menu) => {
    if (!menu._id) {
        console.error(new Error('Id no encontrada'))
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
        console.error(new Error('Error recuperando los datos'))
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.deleteMenu = (id) => {
    if (!id) {
        console.error(new Error('Id no encontrada'))
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
        console.error(new Error('Error recuperando los datos'))
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}