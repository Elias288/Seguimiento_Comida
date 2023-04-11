const AppError = require("./AppError");
const { TOKEN_EXPIRED } = require("./errorCodes");

module.exports = (error, req, res, next) => {
    console.log(`[${new Date()}]`, error);

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
    TokenExpiredError: (res, error) => res.status(400).send({errorCode: TOKEN_EXPIRED, details: "Token expirado"}),
    JsonWebTokenError: (res, error) => res.status(400).send({ error: error.name, details: error.details }),

    SequelizeValidationError: (res, error) => res.status(400).send({ error: error.name, details: error.errors[0].details}),
    SequelizeUniqueConstraintError: (res, error) => res.status(400).send({ error: error.name, details: error.errors[0].details}),

    ValidationError: (res, error) => res.status(400).send({ type: 'ValidationError', details: error.details}),
    
    // userNotFound: (res, error) => res.status(404).send({ error: error.name, details: "Usuario no encontrado" }),
    // outOfTime: (res, error) => res.status(400).send({ error: error.name, details: "Ya no es posible agendarse, fuera de fecha" }),
    // amountExceeded: (res, error) => res.status(400).send({ error: error.name, details: "Ya no es posible agendarse, cantidad excedida" }),
    // invalidDate: (res, error) => res.status(400).send({ error: error.name, details: "Fecha erronea" }),
    // invalidData: (res, error) => res.status(400).send({ error: error.name, details: error.details }),
    // missingData: (res, error) => res.status(404).send({ error: error.name, details: error.details }),
    // tokenNotProvidedError: (res, error) => res.status(400).send({ error: error.name, details: "Token es requerido" }),
    // dataNotUpdated: (res, error) => res.status(400).send({ error: error.name, details: "No se pudo actualizar" }),
    // invalidUserData: (res, error) => res.status(400).send({ error: error.name, details: "Usuario o contraseña invalida" }),
    // unauthorized: (res, error) => res.status(401).send({ error: error.name, details: "No está autorizado" }),
    // accessDenied: (res, error) => res.status(401).send({ error: error.name, details: "Acceso denegado" }),
    // emailNotVerified: (res, error) => res.status(401).send({ error: error.name, details: "Email no verificado" }),
    // dataNoDeleted: (res, error) => res.status(401).send({ error: error.name, details: "No fue posible eliminar" }),
    // notFound: (res, error) => res.status(404).send({ error: error.name, details: error.details }),
    // notDataError: (res, error) => res.status(500).send({ error: error.name, details: "Error recuperando los datos" }),
    
    defaultError: (res) => { res.status(500).send('Something went wrong') }
}