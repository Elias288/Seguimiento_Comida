var bcrypt = require('bcryptjs')
const userServices = require('../services/user.services')

const ROLES = [
    'ADMIN',
    'COMENSAL',
    'COCINERO'
]

exports.create = (req, res, next) => {
    const { name, surName, email, password, password2} = req.body 
    
    if (!name) {
        console.error(new Error('missingData'))
        return next({
            name: 'missingData',
            message: "Name es requerido"
        })
    }
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

    if (password !== password2) return { isError: true, name: "passwordValidationError" }
    
    let newRoles = []

    return userServices.createUser(name, surName, email, password, password2, newRoles).then(data => {
        if (data.isError){
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send({ message: 'Usuario creado exitosamente' })
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
        const { _id, name, surName, email, roles } = data.data.dataValues
    
        return res.status(200).send({ _id, name, surName, email, roles, })
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

exports.addRole = (req, res, next) => {
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

    return userServices.updateUser(userId, user).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send({ message: 'Usuario actualizado' })
    })
}

exports.addToMenu = (req, res, next) => {
    const { menuId, selectedMenu } = req.body
    const { tokenData } = req
    
    if (!tokenData) {
        console.error(new Error('missingData'))
        return next({ name: "Token ir required" })
    }
    if (!(tokenData.roles.includes(ROLES[0]) || tokenData.roles.includes(ROLES[1]))) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }
    if (!selectedMenu) {
        console.error(new Error('missingData'))
        return next({
            name: "missingData",
            message: "selectedMenu es requerido"
        })
    }
    
    userServices.enterToMenu(menuId, selectedMenu, tokenData.id).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send(data.message)
    })
}

exports.deleteToMenu = (req, res, next) => {
    const { menuId } = req.params
    const { tokenData } = req

    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!menuId) {
        console.error(new Error('missingData'))
        return next({ name: "MenuId is required" })
    }

    userServices.dropToMenu(menuId, tokenData.id).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }

        return res.status(200).send(data.message)
    })
}

exports.delete = (req, res, next) => {
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
    if (!(tokenData.roles.includes(ROLES[0]) || tokenData.id == userId)){
        console.error(new Error('unauthorized'))
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
