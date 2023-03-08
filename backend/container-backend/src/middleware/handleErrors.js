const ERROR_HANDLERS = {
    SequelizeValidationError: (res, error) => res.status(400).send({ error: error.name, message: error.errors[0].message}),
    JsonWebTokenError: (res, error) => res.status(400).send({ error: error.name, message: error.message }),
    SequelizeUniqueConstraintError: (res, error) => res.status(400).send({ error: error.name, message: error.errors[0].message}),
    missingData: (res, error) => res.status(404).send({ error: error.name, message: error.message }),
    passwordValidationError: (res, error) => res.status(400).send({ error: error.name, message: "Contraseñas no coinciden" }),
    tokenNotProvidedError: (res, error) => res.status(400).send({ error: error.name, message: "Token es requerido" }),
    TokenExpiredError: (res, error) => res.status(400).send({error: error.name, message: "Su token ha expirado"}),
    dataNotUpdated: (res, error) => res.status(400).send({ error: error.name, message: "No se pudo actualizar" }),
    invalidDate: (res, error) => res.status(400).send({ error: error.name, message: "Fecha erronea" }),
    invalidUserData: (res, error) => res.status(400).send({ error: error.name, message: "Usuario o contraseña invalida" }),
    invalidData: (res, error) => res.status(400).send({ error: error.name, message: error.message }),
    outOfTime: (res, error) => res.status(400).send({ error: error.name, message: "Ya no es posible agendarse, fuera de fecha" }),
    amountExceeded: (res, error) => res.status(400).send({ error: error.name, message: "Ya no es posible agendarse, cantidad excedida" }),
    alreadyCreated: (res, error) => res.status(400).send({ error: error.name, message: error.message }),

    unauthorized: (res, error) => res.status(401).send({ error: error.name, message: "No está autorizado" }),
    accessDenied: (res, error) => res.status(401).send({ error: error.name, message: "Acceso denegado" }),
    emailNotVerified: (res, error) => res.status(401).send({ error: error.name, message: "Email no verificado" }),
    dataNoDeleted: (res, error) => res.status(401).send({ error: error.name, message: "No fue posible eliminar" }),

    notFound: (res, error) => res.status(404).send({ error: error.name, message: error.message }),
    userNotFound: (res, error) => res.status(404).send({ error: error.name, message: "Usuario no encontrado" }),

    notDataError: (res, error) => res.status(500).send({ error: error.name, message: "Error recuperando los datos" }),
    defaultError: (res, error) => {
        console.error(new Error(error))
        res.status(500).send({ defaultError: error })
    }
}


module.exports = (error, req, res, next) => {
    // console.error(new Error(error.name || error))
    // error.name === undefined ? console.error(new Error(error)) : ''

    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(res, error)
}