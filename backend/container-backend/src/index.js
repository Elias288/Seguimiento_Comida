require('dotenv').config()
const http = require('http')
const { Server: WebsocketServer } = require('socket.io')
const app = require('./app')
const sockets = require('./sockets')
const db = require('./models')

const PORT = process.env.PORT || 3000

db.sequelize.sync({ alter: true }).then(() => {
    console.log('db connected')
}).catch(err => {
    console.log('error', err)
})

const server = http.createServer(app)
const httpServer = app.listen(PORT, () => {
	console.log(`Escuchando en el puerto: ${PORT}`)
})

const whiteList = [ 'http://localhost:4200', 'https://master--seguimiento-comida-sofkau.netlify.app', 'https://seguimiento-comida-sofkau.netlify.app' ]
const io = new WebsocketServer(httpServer, { cors: { origin: whiteList } })
sockets(io)