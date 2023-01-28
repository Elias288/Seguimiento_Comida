const db = require("../models")
const User = db.User
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

exports.createUser = (name, surName, email, password, password2, roles) => {
    if (!name) {
        return {
            isError: true,
            name: "missingData", 
            message: "Name es requerido" 
        }
    }
    if (!email) {
        return {
            isError: true,
            name: "missingData", 
            message: "Email es requerido" 
        }
    }
    if (!password) {
        return {
            isError: true,
            name: "missingData", 
            message: "Password es requerido" 
        }
    }

    if (password !== password2) return { isError: true, name: "passwordValidationError" }

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
        return { isError: false, user }
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
    if (!password) {
        return { isError: true, name: "missingData", message: "Password es requerido" }
    }
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
        return { isError:true, name: 'invalidUserData' }
    }
}

exports.updateUser = (id, user) => {
    if (!id) {
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
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.addToMenu = (menuId, selectedMenu, userId) => {
    if (!selectedMenu) {
        return {
            isError: true,
            name: "missingData",
            message: "selectedMenu es requerido"
        }
    }

    return getUserById(userId).then(data => {
        return data.data
    }).then(data => {
        user = data
        return menuService.getMenuById(menuId)
    }).then(data => {
        menu = data.data
        const msBetweenDates = Math.abs(menu.date.getTime() - new Date().getTime());
        const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)
        if (hoursBetweenDates < 24) {
            console.error(new Error("outOfTime"))
            return next({ name: "outOfTime" })
        }

        if (selectedMenu != 'MP' && selectedMenu != 'MS') {
            console.error(new Error("invalidData"))
            return next({ name: "invalidData", message: 'Error en el menu seleccionado' })
        }
        
        return user.addMenus(menu, { through: { selectedMenu } })
    }).then(data => {
        return { isError: false, message: 'Agregado correctamente' }
    }).catch(error => {
        return {
            isError: true,
            name: 'notDataError'
        }
    })
}

exports.deleteUser = (id) => {
    if (!id) {
        return {
            isError: true,
            name: 'missingData',
            message: 'Id es requerida'
        }
    }
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