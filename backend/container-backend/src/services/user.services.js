const db = require("../models")
const { Op } = require("sequelize")
const User = db.User
const Menu = db.Menu
const Menu_User = db.Menu_User
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

exports.createUser = (name, surName, email, password, password2, roles) => {

    const hashedPassword = bcrypt.hashSync(password, 8);

    const userData = {
        _id: uuidv4(),
        name,
        surName,
        email,
        password: hashedPassword,
        roles
    }

    return User.create(userData).then(() => {
        return { isError: false }
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

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
            return {
                isError: true,
                name: 'notFound',
                message: 'User no encontrado'
            }
        }
        return { data, isError: false }
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.getUserByEmail = (email) => {
    if (!email) {
        return { isError: true, name: 'missingData', message: 'Email es requerido' }
    }
    return User.findOne({ where: { email } }).then(data => {
        if (!data) {
            return { isError: true, name: 'userNotFound' }
        }
        return { data, isError: false }
    }).catch(() => {
        return { isError: true, name: 'notDataError' }
    })
}

exports.login = async (email, password) => {
    const data = await this.getUserByEmail(email)
    if (data.isError) {
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
        const token = jwt.sign(tokenData, process.env.SECRET, { expiresIn: 43200 }) // EXPIRA EN 12 HORAS CADA VEZ QUE SE LOGUEA
        return { jwt: token }
    } else {
        return { isError: true, name: 'invalidUserData' }
    }
}

exports.updateUser = (id, user) => {
    return User.update(user, { where: { _id: id } }).then(num => {
        if (num == 1) {
            return { isError: false }
        }
        return { isError: true, name: 'dataNotUpdated' }
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.enterToMenu = async (menuId, selectedMenu, userId) => {
    if (selectedMenu != 'MP' && selectedMenu != 'MS') {
        console.error(new Error("invalidData"))
        return next({ name: "invalidData", message: 'Error en el menu seleccionado' })
    }

    const user = await User.findByPk(userId)
    const menu = await Menu.findByPk(menuId)

    const msBetweenDates = Math.abs(menu.date.getTime() - new Date().getTime());
    const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)

    if (!user) {
        return {
            isError: true,
            name: 'notFound',
            message: 'User no encontrado'
        }
    }
    if (!menu) {
        return {
            isError: true,
            name: 'notFound',
            message: 'Menu no encontrado'
        }
    }
    if (hoursBetweenDates < 12) {
        console.error(new Error("outOfTime"))
        return next({ name: "outOfTime" })
    }

    await user.addMenus(menu, { through: { selectedMenu } })

    return {
        isError: false,
        message: 'Agregado correctamente',
    }
}

exports.dropToMenu = async (menuId, userId) => {
    const user = await User.findByPk(userId)
    const menu = await Menu.findByPk(menuId)

    if (!user) {
        return {
            isError: true,
            name: 'notFound',
            message: 'User no encontrado'
        }
    }
    if (!menu) {
        return {
            isError: true,
            name: 'notFound',
            message: 'Menu no encontrado'
        }
    }

    await Menu_User.destroy({
        where: {
            [Op.and]: [
                { menuId },
                { userId }
            ]
        }
    })

    return {
        isError: false,
        message: 'Eliminado correctamente',
    }
}

exports.deleteUser = (id) => {
    return User.destroy({ where: { _id: id } }).then(num => {
        if (num == 1) return { isError: false }
        return { isError: true, name: 'dataNoDeleted' }
    }).catch(() => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}