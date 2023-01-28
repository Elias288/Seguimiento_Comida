const { Op } = require("sequelize")
const db = require('../models')
var bcrypt = require('bcryptjs')
const Menu_User = db.Menu_User
const userServices = require('../services/user.services')
const menuService = require('../services/menu.services')

const ROLES = [
    'ADMIN',
    'COMENSAL',
    'COCINERO'
]

exports.create = (req, res, next) => {
    const { name, surName, email, password, password2, roles } = req.body 

    userServices.createUser(name, surName, email, password, password2, roles).then(data => {
        if (data.isError){
            console.error(new Error(data))
            return next(data)
        }
        return res.status(200).send(data.user)
    })
}

exports.findOneById = async (req, res, next) => {
    const { tokenData } = req
    const { id } = req.params

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    const data = await userServices.getUserById(tokenData.id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    return userServices.getUserById(id).then(data => {
        if (data.isError) {
            console.error(new Error(data))
            return next(data)
        }
        const user = data.data
        return res.status(200).send(user)
    })
}

exports.findOneByEmail = async (req, res, next) => {
    const { tokenData } = req
    const { email } = req.params

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    const data = await userServices.getUserById(tokenData.id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }

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
    const { tokenData } = req

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    const data = await userServices.getUserById(tokenData.id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }

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
        console.error(new Error(data.name))
        return next(data)
    }
    res.status(200).send(data)
}

exports.getMe = async (req, res, next) => {
    const { tokenData } = req

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }

    const data = await userServices.getUserById(tokenData.id)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    const { _id, name, surName, email, roles } = data.data.dataValues

    res.status(200).send({ _id, name, surName, email, roles, })
}

exports.update = async (req, res, next) => {
    const { name, surName, email, password} = req.body
    const { tokenData } = req
    
    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }

    if (password) password = bcrypt.hashSync(password, 8)

    const user = { name, surName, email, password }
    const data = await userServices.updateUser(tokenData.id, user)

    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    res.status(200).send({ message: 'Usuario actualizado' })
}

exports.addRole = async (req, res, next) => {
    const { roles, userId } = req.body
    const { tokenData } = req

    if (!tokenData){
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!tokenData.roles.includes(ROLES[0])) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }
    if (!userId) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "userId es requerido" })
    }
    if (roles == null || roles == undefined) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "roles es requerido" })
    }

    let newRoles 
    if (roles.length > 0) {
        newRoles = roles.split(",")
    } else newRoles = []

    const user = { roles: newRoles }
    const data = await userServices.updateUser(userId, user)

    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }
    res.status(200).send({ message: 'Usuario actualizado' })
    
}

exports.addToMenu = async (req, res, next) => {
    const { menuId, selectedMenu } = req.body
    const { tokenData } = req
    
    if (!tokenData) {
        console.error(new Error('missingData'))
        return next({ name: "Token ir required" })
    }

    if (!(tokenData.roles.includes(ROLES[0]) || tokenData.roles.includes(ROLES[1]))) {
        return {
            isError: true,
            name: "unauthorized"
        }
    }
    
    userServices.addToMenu(menuId, selectedMenu, tokenData.id).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }

        return res.status(200).send({ message: 'Agregado correctamente' })
    })
}

exports.deleteToMenu = async (req, res, next) => {
    const { menuId } = req.params
    const { tokenData } = req

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }

    return userServices.getUserById(tokenData.id).then(data => {
        if (data.isError) {
            return next(data)
        }
        return data.data
    }).then(data => {
        return Menu_User.destroy({ 
            where: {
                [Op.and]: [
                    { menuId },
                    { userId: tokenData.id }
                ]
            }
        }).then(num => {
            if (num == 1) return { isError: false }
            return { isError: true, name: 'dataNoDeleted' }
        }).catch(() => {
            console.error(new Error('Error recuperando los datos'))
            return {
                isError: true,
                name: 'notDataError'
            }
        })
    }).then(data => {
        if (data.isError) return next(data)

        return res.status(200).send({ message: 'Usuario dado de baja correctamente' })
    })
}

exports.delete = async (req, res, next) => {
    const { tokenData } = req
    const { userId } = req.params

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }

    if (!(tokenData.roles.includes(ROLES[0]) || tokenData.id == userId)){
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }

    const data = await userServices.deleteUser(userId)
    if (data.isError) {
        console.error(new Error(data))
        return next(data)
    }

    res.status(200).send({ message: 'Usuario eliminado' })
}
