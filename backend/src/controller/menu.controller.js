const db = require('../models')
const menuServices = require('../services/menu.services')
const Menu = db.Menu
const { v4: uuidv4 } = require('uuid')

exports.create = (req, res, next) => {
    const { name, ingredientes, fecha } = req.body
    const { tokenData } = req
    
    if (!tokenData.kitchener) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }
    if (!name) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Name es requerido" })
    }
    if (!ingredientes) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Ingredientes es requerido" })
    }
    if (!fecha) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Fecha es requerido" })
    }
    
    const menuData = {
        _id: uuidv4(),
        name,
        ingredientes,
        date: fecha
    }

    Menu.create(menuData).then(data => {
        const { dataValues: menu } = data
        return res.status(201).send(menu)
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
    const { id } = req.body
    const data = await menuServices.getUsersOfMenu(id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    const menu = data.data
    const users = menu.users.map(user => {
        return {
            _id: user._id,
            name: user.name,
            surName: user.surName,
            email: user.email
        }
    })
    return res.status(200).send(users)
}

exports.findOneById = async (req, res, next) => {
    const { id } = req.body
    const data = await menuServices.getMenuById(id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    const menu = data.data
    return res.status(200).send(menu)
}

exports.findOneByDate = async (req, res, next) => {
    const { date } = req.body
    const data = await menuServices.getMenuByDate(date)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    const menu = data.data
    return res.status(200).send(menu)
}

exports.update = async (req, res, next) => {
    const { name, ingredientes, date, } = req.body
    const { tokenData } = req

    const menu = { name, ingredientes, date }
    const data = await menuServices.updateMenu(tokenData.id, menu)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    res.status(200).send('Menu actualizado')
}