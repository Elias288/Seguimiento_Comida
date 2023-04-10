var bcrypt = require('bcryptjs')
const userServices = require('../services/user.services')
const Joi = require("joi");
const { tryCatch } = require('../services/tryCatch');
const AppError = require('../middleware/AppError');

//''            -1
//'ADMIN',      0
//'COCINERO'    1
//'COMENSAL',   2
//'All'         3

const createUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    repeat_password: Joi.ref('password')
})

exports.create = tryCatch(async (req, res) => {
    const { name, surName, email, password, password2} = req.body 

    const {error} = createUserSchema.validate({ name, email, password, repeat_password: password2 })
    if (error) throw error

    const data = await userServices.createUser(name, surName, email, password)
    if (data.isError) {
        throw new AppError(data.errorCode, data.details, data.status)
    }
    
    return res.status(200).send({ message: 'Usuario creado exitosamente', user: data.user })
})

exports.confirmEmail = (req, res, next) => {
    const { token } = req.params

    if (!token) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }

    return userServices.validateEmail(token).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send({message: 'Email verificado'})
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
        console.error(new Error(data.name))
        return next(data)
    }
    return userServices.getUserById(id).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
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
        console.error(new Error(data.name))
        return next(data)
    }

    return userServices.getUserByEmail(email).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        const user = data.data
        return res.status(200).send(user)
    })
}

exports.findAll = (req, res, next) => {
    const { tokenData } = req

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    
    return userServices.getUserById(tokenData.id).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
    
        return userServices.getAll().then(data => {
            res.status(200).send(data)
        }).catch(error => {
            next(error)
        })
    })
}

exports.login = (req, res, next) => {
    const { email, password } = req.body

    if (!email) {
        console.error(new Error('missingData'))
        return next({
            name: "missingData",
            message: "Email es requerido"
        })
    }
    if (!password) {
        console.error(new Error('missingData'))
        return next({
            name: "missingData",
            message: "Password es requerido"
        })
    }

    return userServices.login(email, password).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send(data)
    })
}

exports.getMe = (req, res, next) => {
    const { tokenData } = req

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }

    return userServices.getUserById(tokenData.id).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        const { _id, name, surName, email, rol } = data.data.dataValues
    
        return res.status(200).send({ _id, name, surName, email, rol })
    })
}

exports.update = (req, res, next) => {
    const { name, surName, email, password} = req.body
    const { tokenData } = req
    
    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!tokenData.id) {
        return next({
            name: 'missingData',
            message: 'Id es requerida'
        })
    }

    if (password) password = bcrypt.hashSync(password, 8)

    const user = { name, surName, email, password }
    return userServices.updateUser(tokenData.id, user).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send({ message: 'Usuario actualizado' })
    })
}

exports.addRole = async (req, res, next) => {
    const { rol, userId } = req.body
    const { tokenData } = req

    if (!tokenData){
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    const data = await userServices.getUserById(tokenData.id),
    user = data.data.dataValues
    if (user.rol != 0) {
        return next({ name: "unauthorized" })
    }
    if (!userId) {
        console.error(new Error('missingData'))
        return next({ name: "missingData", message: "userId es requerido" })
    }
    if (rol == undefined) {
        return next({ name: "missingData", message: "roles es requerido" })
    }

    const userData = { rol }
    return userServices.updateUser(userId, userData).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send({ message: 'Usuario actualizado' })
    })
}

exports.delete = async (req, res, next) => {
    const { tokenData } = req
    const { userId } = req.params

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!userId) {
        console.error(new Error('missingData'))
        return next({
            name: 'missingData',
            message: 'Id es requerida'
        })
    }
    const data = await userServices.getUserById(tokenData.id),
    user = data.data.dataValues
    if (!(user.rol == 0 || tokenData.id == userId)){
        return next({ name: "unauthorized" })
    }

    return userServices.deleteUser(userId).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
    
        return res.status(200).send({ message: 'Usuario eliminado' })
    })
}
