const { v4: uuidv4 } = require('uuid')
const db = require('../models')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
const User = db.User
const Op = db.Sequelize.Op
const userServices = require('../services/user.services')

exports.create = (req, res, next) => {
    const { name, surName, email, password, password2, admin, kitchener } = req.body 

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
        admin: Boolean(admin),
        kitchener: Boolean(kitchener)
    }

    User.create(userData).then(data => {
        const { dataValues: user } = data
        return res.status(201).send(user)
    }).catch(error => {
        console.error(new Error(error))
        return next(error)
    })
}

exports.findOneById = async (req, res, next) => {
    const { id } = req.body
    const data = await userServices.getUserById(id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    return res.status(200).send(data)
}

exports.findOneByEmail = async (req, res, next) => {
    const { email } = req.body
    const data = await userServices.getUserByEmail(email)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    return res.status(200).send(data)
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
    res.status(200).send({
        name: data.name,
        surName: data.surName,
        email: data.email,
        admin: tokenData.admin,
        kitchener: tokenData.kitchener
    })
}

exports.update = async (req, res, next) => {
    const { name, surName, email, password } = req.body
    const { tokenData } = req

    if (password) password = bcrypt.hashSync(password, 8)

    const user = { name, surName, email, password }
    const data = await userServices.updateUser(tokenData.id, user)

    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    res.status(200).send('Usuario actualizado')
}