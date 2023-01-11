const express = require('express')
const http = require('http')
const cors = require('cors')
const db = require('./models')
const bodyParser = require('body-parser')
const { author, license, name, description } = require('../package.json')
const userRouter = require('./routes/user.router')
const handleErrors = require('./middleware/handleErrors')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('json spaces', 2)

db.sequelize.sync().then(() => {
    console.log('db connected')
}).catch(err => {
    console.log('error', err.message)
})

app.get('/', (req, res) => {
    return res.send({ name, author, description, license })
})

app.use('/api/user', userRouter)

app.use((req, res, next) => {
    console.log('notFound')
    return res.status(404).send('404 not found')
})
app.use(handleErrors)

/**
 * TODO: Router, controller y service de Menú
 * TODO: CreateMenu, updateMenu, getMenuById, getMenuByName, getUsersByMenu
 * TODO: pushUserToMenu
 * TODO: separar roles
 * 
 * DONE: updateUser
 */

module.exports = server

