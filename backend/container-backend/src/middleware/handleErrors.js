const AppError = require("./AppError");

const ERROR_HANDLERS = {
    SequelizeValidationError: (res, error) => res.status(400).send({ error: error.name, details: error.errors[0].details}),
    JsonWebTokenError: (res, error) => res.status(400).send({ error: error.name, details: error.details }),
    SequelizeUniqueConstraintError: (res, error) => res.status(400).send({ error: error.name, details: error.errors[0].details}),
    missingData: (res, error) => res.status(404).send({ error: error.name, details: error.details }),
    tokenNotProvidedError: (res, error) => res.status(400).send({ error: error.name, details: "Token es requerido" }),
    TokenExpiredError: (res, error) => res.status(400).send({error: error.name, details: "Su token ha expirado"}),
    dataNotUpdated: (res, error) => res.status(400).send({ error: error.name, details: "No se pudo actualizar" }),
    invalidDate: (res, error) => res.status(400).send({ error: error.name, details: "Fecha erronea" }),
    invalidUserData: (res, error) => res.status(400).send({ error: error.name, details: "Usuario o contraseña invalida" }),
    invalidData: (res, error) => res.status(400).send({ error: error.name, details: error.details }),
    outOfTime: (res, error) => res.status(400).send({ error: error.name, details: "Ya no es posible agendarse, fuera de fecha" }),
    amountExceeded: (res, error) => res.status(400).send({ error: error.name, details: "Ya no es posible agendarse, cantidad excedida" }),

    unauthorized: (res, error) => res.status(401).send({ error: error.name, details: "No está autorizado" }),
    accessDenied: (res, error) => res.status(401).send({ error: error.name, details: "Acceso denegado" }),
    emailNotVerified: (res, error) => res.status(401).send({ error: error.name, details: "Email no verificado" }),
    dataNoDeleted: (res, error) => res.status(401).send({ error: error.name, details: "No fue posible eliminar" }),

    notFound: (res, error) => res.status(404).send({ error: error.name, details: error.details }),
    userNotFound: (res, error) => res.status(404).send({ error: error.name, details: "Usuario no encontrado" }),

    notDataError: (res, error) => res.status(500).send({ error: error.name, details: "Error recuperando los datos" }),
    
    ValidationError: (res, error) => res.status(400).send({ type: 'ValidationError', details: error.details}),
    defaultError: (res) => { res.status(500).send('Something went wrong') }
}

module.exports = (error, req, res, next) => {
    console.log(error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            errorCode: error.errorCode,
            errorMessage: error.message
        });
    }

    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(res, error)
}