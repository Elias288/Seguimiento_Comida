const { v4: uuidv4 } = require('uuid')
const db = require('../models')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
const User = db.User
const Op = db.Sequelize.Op
const userServices = require('../services/user.services')
const menuService = require('../services/menu.services')
const { Menu } = require('../models')

exports.create = (req, res, next) => {
    const { name, surName, email, password, password2, roles } = req.body 

    if (!name) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Name es requerido" })
    }
    if (!email) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Email es requerido" })
    }
    if (!password) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "Password es requerido" })
    }
    if (password !== password2) return next({ name: "passwordValidationError" })
    
    const hashedPassword = bcrypt.hashSync(password, 8);

    const userData = {
        _id: uuidv4(),
        name,
        surName,
        email,
        password: hashedPassword,
        roles
    }

    User.create(userData).then(data => {
        const { dataValues: user } = data
        return res.status(201).send(user)
    }).catch(error => {
        console.error(new Error(error))
        return next(error)
    })
}

exports.findOneById = (req, res, next) => {
    const { id } = req.body
    return userServices.getUserById(id).then(data => {
        if (data.isError) {
            console.error(new Error(data))
            return next(data)
        }
        const user = data.data
        return res.status(200).send(user)
    })
}

exports.findOneByEmail = (req, res, next) => {
    const { email } = req.body
    return userServices.getUserByEmail(email).then(data => {
        if (data.isError) {
            console.error(new Error(data))
            return next(data)
        }
        const user = data.data
        return res.status(200).send(user)
    })
}

exports.findAll = async (req, res, next) => {
    return await userServices.getAll().then(data => {
        res.status(200).send(data)
    }).catch(error => {
        next(error)
    })
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body
    const data = await userServices.login(email, password)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    res.status(200).send(data)
}

exports.getMe = async (req, res, next) => {
    const { tokenData } = req

    const data = await userServices.getUserById(tokenData.id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    const { _id, name, surName, email, roles } = data.data.dataValues

    res.status(200).send({ _id, name, surName, email, roles, })
}

exports.update = async (req, res, next) => {
    const { name, surName, email, password, kitchener, admin } = req.body
    const { tokenData } = req

    if (password) password = bcrypt.hashSync(password, 8)

    const user = { name, surName, email, password, kitchener, admin }
    const data = await userServices.updateUser(tokenData.id, user)

    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    res.status(200).send({ message: 'Usuario actualizado' })
}

exports.addToMenu = async (req, res, next) => {
    const { menuId, selectedMenu } = req.body
    const { tokenData } = req

    let user, menu

    if (!selectedMenu) {
        console.error(new Error('selectedMenu'))
        return next({ name: "missingData", message: "selectedMenu es requerido" })
    }

    return userServices.getUserById(tokenData.id).then(data => {
        if (data.isError) {
            return next(data)
        }
        return data.data
    }).then(data => {
        user = data
        return menuService.getMenuById(menuId)
    }).then(data => {
        if (data.isError) {
            return next(data)
        }
        menu = data.data
        const msBetweenDates = Math.abs(menu.date.getTime() - new Date().getTime());
        const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)
        if (hoursBetweenDates < 24) {
            console.error(new Error("outOfTime"))
            return next({ name: "outOfTime" })
        }
        
        return user.addMenus(menu, { through: { selectedMenu } })
    }).then(data => {
        res.status(200).send({ message: 'Agregado correctamente' })
    }).catch(error => {
        next(error)
    })
    
}