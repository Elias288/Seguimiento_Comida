require('dotenv').config()
const http = require('http')
const { Server: WebsocketServer } = require('socket.io')
const app = require('./app')
const sockets = require('./sockets')

const PORT = process.env.PORT || 8080

const server = http.createServer(app)
const httpServer = app.listen(PORT, () => {
	console.log(`Escuchando en el puerto: ${PORT}`)
})

const io = new WebsocketServer(httpServer)
sockets(io)