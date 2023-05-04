const AppError = require("./AppError");
const { TOKEN_EXPIRED } = require("./errorCodes");

module.exports = (error, req, res, next) => {
    console.error(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}]`, error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            errorCode: error.errorCode,
            errorMessage: error.message
        });
    }

    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(res, error)
}

const ERROR_HANDLERS = {
    // TokenExpiredError: (res, error) => res.status(400).send({errorCode: TOKEN_EXPIRED, details: "Token expirado"}),
    // JsonWebTokenError: (res, error) => res.status(400).send({ error: error.name, details: error.details }),

    // SequelizeValidationError: (res, error) => res.status(400).send({ error: error.name, details: error.errors[0].details}),
    // SequelizeUniqueConstraintError: (res, error) => res.status(400).send({ error: error.name, details: error.errors[0].details}),

    // ValidationError: (res, error) => res.status(400).send({ type: 'ValidationError', details: error.details}),
    
    defaultError: (res) => { res.status(500).send('Something went wrong') }
}