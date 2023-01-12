const jwt = require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']
    if (!token) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!token.toLowerCase().startsWith('bearer')) {
        console.error(new Error('accessDenied'))
        return next({ name: "accessDenied" })
    }

    try {
        const subToken = token.substring(7)
        req.tokenData = jwt.verify(subToken, process.env.SECRET)
        return next()
    } catch (error) {
        console.error(new Error(error.name))
        return next(error)
    }
}