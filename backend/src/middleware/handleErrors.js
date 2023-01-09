const ERROR_HANDLERS = {
    SequelizeValidationError: (res, error) => res.status(400).send({ error: error.name, message: error.errors}),
    missingData: (res, error) => res.status(400).send({ error: error.name, message: error.message }),
    passwordValidationError: (res, error) => res.status(400).send({ error: error.name, message: error.message }),
    SequelizeUniqueConstraintError: (res, error) => res.status(400).send({ error: error.name, message: error.errors }),

    defaultError: (res, error) => res.status(500).send({ defaultError: error })
}


module.exports = (error, req, res, next) => {
    console.error('error', error)

    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(res, error)
}