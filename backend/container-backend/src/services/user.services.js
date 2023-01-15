const { User } = require("../models")
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

exports.getAll = () => {
    return User.findAll()
}

exports.getUserById = (id) => {
    if (!id) {
        console.error(new Error('Id no encontrada'))
        return {
            isError: true,
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
    return User.findByPk(id).then(data => {
        if (!data) {
            console.error(new Error('Usuario no encontrado'))
            return {
                isError: true,
                name: 'notFound',
                message: 'User no encontrado'
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

exports.getUserByEmail = (email) => {
    if (!email) {
        console.error(new Error('Email no encontrada'))
        return { isError: true, name: 'missingData', message: 'Email es requerido' }
    }
    return User.findOne({ where: { email } }).then(data => {
        if (!data) {
            console.error(new Error('Usuario no encontrado'))
            return { isError: true, name: 'userNotFound' }
        }
        return { data, isError: false }
    }).catch(() => {
        console.error(new Error('Error recuperando los datos'))
        return { isError: true, name: 'notDataError' }
    })
}

exports.login = async (email, password) => {
    if (!password) {
        console.error(new Error('Contraseña no encontrada'))
        return { isError: true, name: "missingData", message: "Password es requerido" }
    }
    const data = await this.getUserByEmail(email)
    if (data.isError) {
        console.error(new Error(data.name))
        return { isError: true, name: data.name, message: data.message }
    }
    const user = data.data

    if (await bcrypt.compare(password, user.password)) {
        const tokenData = { 
            id: user._id,
            roles: user.roles,
            name: user.name,
            surName: user.surName,
            email: user.email 
        }
        const token = jwt.sign(tokenData, process.env.SECRET, { expiresIn: 86400 })
        return { jwt: token }
    } else {
        return { isError:true, name: 'invalidUserData' }
    }
}

exports.updateUser = (id, user) => {
    if (!id) {
        console.error(new Error('Id no encontrada'))
        return {
            isError: true,
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
    return User.update(user, { where: { _id: id } }).then(num => {
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