var bcrypt = require('bcryptjs')
const userServices = require('../services/user.services')
const Joi = require("joi");
const { tryCatch } = require('../services/tryCatch');
const AppError = require('../middleware/AppError');
const { TOKEN_NO_PROVIDED, MISSING_DATA, UNAUTHORIZED } = require('../middleware/errorCodes');
var jwt = require('jsonwebtoken')

//''            -1
//'ADMIN',      0
//'COCINERO'    1
//'COMENSAL',   2
//'All'         3

const createUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: Joi.ref('password'),

    access_token: [
        Joi.string(), Joi.number()
    ]
})

const loginUserSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
})

exports.create = tryCatch(async (req, res) => {
    const { name, surName, email, password, password2} = req.body 

    const {error} = createUserSchema.validate({ name, email, password, repeat_password: password2 })
    if (error) throw error

    const data = await userServices.createUser(name, surName, email, password)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)
    
    console.log(`[${new Date()}]`, 'User:', data.user.email, 'created')
    return res.status(200).send({ message: 'Usuario creado exitosamente' })
})

exports.confirmEmail = tryCatch(async (req, res) => {
    const { token } = req.params

    if (!token) throw new AppError(TOKEN_NO_PROVIDED, 'Token es requerido', 400)

    const {id, email} = jwt.verify(token, process.env.SECRET)
    const data = await userServices.validateEmail(id)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    console.log(`[${new Date()}]`, 'User:', email, 'confirmed')
    return res.status(200).send({message: 'Email verificado'})
})

exports.findOneById = tryCatch(async (req, res) => {
    const { id } = req.params

    if (!id) throw new AppError(MISSING_DATA, 'Falta parametro necesaria', 404)
            
    const data = await userServices.getUserById(id)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    const user = data.data
    return res.status(200).send(user)
})

exports.findOneByEmail = tryCatch(async (req, res) => {
    const { email } = req.params

    const data = await userServices.getUserByEmail(email)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    const user = data.data
    return res.status(200).send(user)
})

exports.findAll = tryCatch(async (req, res) => {
    const data = await userServices.getAll()
    res.status(200).send(data)
})

exports.login = tryCatch(async (req, res) => {
    const { email, password } = req.body

    const {error} = loginUserSchema.validate({ email, password })
    if (error) throw error

    const data = await userServices.login(email, password)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    return res.status(200).send(data)
})

exports.getMe = tryCatch(async (req, res) => {
    const { tokenData } = req

    const data = await userServices.getUserById(tokenData.id)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    const { _id, name, surName, email, rol } = data.data.dataValues

    return res.status(200).send({ _id, name, surName, email, rol })
})

exports.update = tryCatch(async (req, res) => {
    const { name, surName, email, password} = req.body
    const { tokenData } = req

    if (password) password = bcrypt.hashSync(password, 8)
    const user = { name, surName, email, password }
    
    const data = await userServices.updateUser(tokenData.id, user)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    console.log(`[${new Date()}] User: [${email}] updated`)
    return res.status(200).send({ message: 'Usuario actualizado' })
})

exports.addRole = tryCatch(async (req, res) => {
    const { rol, userId } = req.body
    const { tokenData } = req

    const userById = await userServices.getUserById(tokenData.id),
    user = userById.data.dataValues
    
    if (user.rol != 0) throw new AppError(UNAUTHORIZED, "No está autorizado", 401)

    if (!userId) throw new AppError(MISSING_DATA, "userId es requerido", 404)

    if (rol == undefined) throw new AppError(MISSING_DATA, "roles es requerido", 404)

    const userData = { rol }
    const data = await userServices.updateUser(userId, userData)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)
    
    console.log(`[${new Date()}] User: [${userById}] rol change`)
    return res.status(200).send({ message: 'Usuario actualizado' })
})

exports.delete = tryCatch(async (req, res) => {
    const { tokenData } = req
    const { userId } = req.params

    if (!userId) throw new AppError(MISSING_DATA, "userId es requerido", 404)

    const userById = await userServices.getUserById(tokenData.id),
    user = userById.data.dataValues

    if (!(user.rol == 0 || tokenData.id == userId)) throw new AppError(UNAUTHORIZED, "No está autorizado", 401)

    const data = await userServices.deleteUser(userId)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    console.log(`[${new Date()}] User: [${userId}] deleted by [${userById.email}]`)
    return res.status(200).send({ message: 'Usuario eliminado' })
})
