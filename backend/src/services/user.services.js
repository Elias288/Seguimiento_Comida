const db = require("../models")
const nodemailer = require('nodemailer')
const { Op } = require("sequelize")
const User = db.User
const Menu = db.Menu
const Menu_User = db.Menu_User
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { ALREADY_CREATE, SERVER_ERROR, INFO_NOT_FOUND, NOT_VALIDATED, INVALID_DATA } = require("../middleware/errorCodes")

exports.createUser = async (name, surName, email, password) => {
    const hashedPassword = bcrypt.hashSync(password, 8);

    const userData = {
        _id: uuidv4(),
        name,
        surName,
        email,
        password: hashedPassword,
        rol: -1, // se crea sin rol
        emailVerified: 0,
    }

    const user = await User.findOne({ where: { email } })
    if (user){
        return {
            isError: true,
            errorCode: ALREADY_CREATE,
            details: `Correo [${user.email}] ya registrado`,
            statusCode: 400,
        }
    }

    return User.create(userData).then((user) => {
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.SECRET)
        if (process.env.DEV) {
            console.log(token)
            return { isError: false,  user}
        } 

        sendConfirmationEmail(user.email, token)
        return { isError: false, user}
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}

sendConfirmationEmail = (userMail, token) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    })

    const urlConfirm = `${process.env.APIGETWAY_URL}/confirm/${token}`

    return {
        isError: false,
        transport: transporter.sendMail({
            from: process.env.MAIL_ADMIN_ADDRESS,
            to: userMail,
            subject: "Confirmar Email - Seguimiento comida Sofka",
            html: `<p>Cofirmar email: <a href="${urlConfirm}">Aquí</a></p>`
        })
    }
}

exports.validateEmail = (id) => {
    return User.update({ emailVerified: 1 }, { where: { _id: id } }).then(num => {
        if (num == 1) {
            return { isError: false }
        }
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: "No se pudo actualizar",
            statusCode: 400,
        }

    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}

exports.getAll = () => {
    return User.findAll()
}

exports.getUserById = (id) => {
    if (!id) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Id es requerida []',
            statusCode: 404,
        }
    }

    return User.findByPk(id).then(data => {
        if (!data) {
            return {
                isError: true,
                errorCode: INFO_NOT_FOUND,
                details: `Usuario no encontrado [${id}]`,
                statusCode: 404,
            }
        }
        return { data, isError: false }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}

exports.getUserByEmail = (email) => {
    if (!email) {
        return {
            isError: true,
            errorCode: MISSING_DATA,
            details: 'Email es requerido []',
            statusCode: 404,
        }
    }

    return User.findOne({ where: { email } }).then(data => {
        if (!data) {
            return {
                isError: true,
                errorCode: INFO_NOT_FOUND,
                details: `Usuario no encontrado [${email}]`,
                statusCode: 404,
            }
        }
        return { data, isError: false }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}

exports.login = async (email, password) => {
    const data = await this.getUserByEmail(email)
    if (data.isError)  return data

    const user = data.data
    
    if (!user.emailVerified) {
        return {
            isError: true,
            errorCode: NOT_VALIDATED,
            details: `Email no verificado [${user.email}]`,
            statusCode: 401,
        }
    }

    if (await bcrypt.compare(password, user.password)) {
        const tokenData = { id: user._id, email: user.email }
        const token = jwt.sign(tokenData, process.env.SECRET, { expiresIn: 259200 }) // EXPIRA EN 72 HORAS CADA VEZ QUE SE LOGUEA
        return { jwt: token }
    } else {
        return {
            isError: true,
            errorCode: INVALID_DATA,
            details: 'Usuario o contraseña invalida',
            statusCode: 400,
        }
    }
}

exports.updateUser = (id, user) => {
    return User.update(user, { where: { _id: id } }).then(num => {
        if (num == 1) {
            return { isError: false }
        }

        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: "No se pudo actualizar",
            statusCode: 400,
        }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}

exports.enterToMenu = async (menuId, selectedMenu, userId, entryDate) => {
    if (selectedMenu != 'MP' && selectedMenu != 'MS') {
        console.error(new Error("invalidData"))
        return { name: "invalidData", details: 'Error en el menu seleccionado' }
    }

    const user = await User.findByPk(userId)
    const menu = await Menu.findByPk(menuId)
    const menu_user = await Menu_User.findAndCountAll({ where: { menuId } })

    if (!user) {
        return {
            isError: true,
            errorCode: INFO_NOT_FOUND,
            details: 'User no encontrado',
            statusCode: 404,
        }
    }
    if (!menu) {
        return {
            isError: true,
            errorCode: INFO_NOT_FOUND,
            details: 'Menu no encontrado',
            statusCode: 404,
        }
    }

    const msBetweenDates = menu.date.getTime() - entryDate.getTime();
    const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)
    if (hoursBetweenDates <= 0) {
        return { 
            isError: true,
            errorCode: INVALID_DATA,
            details: 'Ya no es posible agendarse, fuera de fecha',
            statusCode: 400,
        }
    }

    if (menu_user.count > 12) {
        return { 
            isError: true,
            errorCode: INVALID_DATA,
            details: 'Ya no es posible agendarse, cantidad excedida',
            statusCode: 400,
        }
    }

    await user.addMenus(menu, { through: { selectedMenu, entryDate } })

    return {
        isError: false,
        details: 'Agregado correctamente',
    }
}

exports.dropToMenu = async (menuId, userId, dropDate) => {
    const user = await User.findByPk(userId)
    const menu = await Menu.findByPk(menuId)

    if (!user) {
        return {
            isError: true,
            errorCode: INFO_NOT_FOUND,
            details: 'User no encontrado',
            statusCode: 404,
        }
    }
    if (!menu) {
        return {
            isError: true,
            errorCode: INFO_NOT_FOUND,
            name: 'notFound',
            details: 'Menu no encontrado',
            statusCode: 404,
        }
    }

    const msBetweenDates = menu.date.getTime() - dropDate.getTime();
    const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)
    if (hoursBetweenDates <= 0) {
        return { 
            isError: true,
            errorCode: INVALID_DATA,
            details: 'Ya no es posible cambiar el registro',
            statusCode: 400,
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
        details: 'Eliminado correctamente',
    }
}

exports.deleteUser = (id) => {
    return User.destroy({ where: { _id: id } }).then(num => {
        if (num == 1) return { isError: false }
        
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: "No fue posible eliminar",
            statusCode: 401,
        }
    }).catch((err) => {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err,
            statusCode: 500,
        }
    })
}