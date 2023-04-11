const AppError = require("./AppError");
const { DEFAULT_ERROR } = require("./errorCodes");

const handleSocketErrors = (error, socket) => {
    console.error(`[${new Date()}]`, error);

    if (error instanceof AppError) {
        return socket.emit('server:error', { errorCode: error.errorCode, errorMessage: error.message })
    }

    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(socket, error)
}

const ERROR_HANDLERS = {
    defaultError: (socket) => socket.emit('server:error', { errorCode: DEFAULT_ERROR, errorMessage: 'Something went wrong' })
}

module.exports = handleSocketErrors
