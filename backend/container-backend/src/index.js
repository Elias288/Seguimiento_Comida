require('dotenv').config()

const server = require('./app')

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
	console.log(`Escuchando en el puerto: ${PORT}`)
})
