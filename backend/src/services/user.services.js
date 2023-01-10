const { User } = require("../models")
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

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
                name: 'userNotFound'
            }
        }
        return { ...data.dataValues, isError: false }
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
        return {...data.dataValues, isError: false}
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

    if (await bcrypt.compare(password, data.password)) {
        const token = jwt.sign({ id: data._id }, process.env.SECRET, { expiresIn: 86400 })
        return {
            _id: data._id,
            name: data.name,
            surName: data.surName,
            email: data.email,
            jwt: token
        }
    } else {
        return { isError:true, name: 'invalidData' }
    }
}