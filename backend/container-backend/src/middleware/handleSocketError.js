const AppError = require("./AppError");
const { DEFAULT_ERROR } = require("./errorCodes");

const handleSocketErrors = (error, socket) => {
    
    if (error instanceof AppError) {
        console.error(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}] [${error.errorCode}] ${error.message}`);
        return socket.emit('server:error', { errorCode: error.errorCode, errorMessage: error.message })
    }
    
    console.error(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}]`, error);
    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(socket, error)
}

const ERROR_HANDLERS = {
    defaultError: (socket) => socket.emit('server:error', { errorCode: DEFAULT_ERROR, errorMessage: 'Something went wrong' })
}

module.exports = handleSocketErrors
