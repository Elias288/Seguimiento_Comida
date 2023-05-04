const jwt = require('jsonwebtoken')
const AppError = require('./AppError')
const { ACCESS_DENIED } = require('./errorCodes')
const { tryCatch } = require('../services/tryCatch')

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']
        
        if (!token) throw new AppError(TOKEN_NO_PROVIDED, 'Token es requerido', 400)
        if (!token.toLowerCase().startsWith('bearer')) throw new AppError(ACCESS_DENIED, 'Acceso denegado', 401)

        const subToken = token.substring(7)
        req.tokenData = jwt.verify(subToken, process.env.SECRET)

        return next()
    } catch (error) {
        return next(error)
    }
}