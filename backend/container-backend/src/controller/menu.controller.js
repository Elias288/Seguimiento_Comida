const db = require('../models')
const menuServices = require('../services/menu.services')
const Menu = db.Menu
const { v4: uuidv4 } = require('uuid')

const ROLES = [
    'ADMIN',
    'COMENSAL',
    'COCINERO'
]

exports.create = (req, res, next) => {
    const { menuPrincipal, menuSecundario, date } = req.body
    const { tokenData } = req
    
    if (!tokenData || !checkRoles(tokenData)) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }
    if (!menuPrincipal) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Name es requerido" })
    }
    if (!date) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Fecha es requerido" })
    }
    const dataDate = new Date(date)

    if (+dataDate <= +new Date()) {
        console.error(new Error('invalidDate'))
        return next({ name: "invalidDate" })
    }
    
    const menuData = {
        _id: uuidv4(),
        menuPrincipal,
        menuSecundario,
        date: dataDate
    }

    Menu.create(menuData).then(data => {
        return res.status(201).send(data)
    }).catch(error => {
        console.error(new Error(error))
        return next(error)
    })
}

exports.findAll = async (req, res, next) => {
    return menuServices.getAllMenu().then(data => {
        res.status(200).send(data)
    }).catch(error => {
        next(error)
    })
}

exports.findUsersByMenu = async (req, res, next) => {
    const { id: menuId } = req.body
    
    const data = await menuServices.getUsersOfMenu(menuId)
    if (data.isError) {
        console.error(new Error(data.name))
        return next(data)
    }
    const menu = data.data
    const users = menu.users.map(user => {
        return {
            _id: user._id,
            name: user.name,
            surName: user.surName,
            email: user.email,
            selectedMenu: user.Menu_User.selectedMenu
        }
    })
    return res.status(200).send(users)
}

exports.findOneById = async (req, res, next) => {
    const { id } = req.body
    const data = await menuServices.getMenuById(id)
    if (data.isError) {
        console.error(new Error(data.name))
        return next(data)
    }
    const menu = data.data
    return res.status(200).send(menu)
}

exports.findOneByDate = async (req, res, next) => {
    const { date } = req.body
    const data = await menuServices.getMenuByDate(date)
    if (data.isError) {
        console.error(new Error(data.name))
        return next(data)
    }
    const menu = data.data
    return res.status(200).send(menu)
}

exports.update = async (req, res, next) => {
    const { menuPrincipal, menuSecundario, date, _id } = req.body
    const { tokenData } = req

    if (!checkRoles(tokenData)) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }

    const menu = {  menuPrincipal, menuSecundario, date, _id }
    const data = await menuServices.updateMenu(menu)
    if (data.isError) {
        console.error(new Error(data.name))
        return next(data)
    }
    res.status(200).send({ message: 'Menu actualizado' })
}

exports.delete = async (req, res, next) => {
    const { menuId } = req.params
    const { tokenData } = req
    
    if (!checkRoles(tokenData)) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }

    const data = await menuServices.deleteMenu(menuId)
    if (data.isError) {
        console.error(new Error(data.name))
        return next(data)
    }
    res.status(200).send({ message: 'Menu eliminado' })
}

checkRoles = (token) => {
    return token.roles.includes(ROLES[2]) || token.roles.includes(ROLES[0])
}