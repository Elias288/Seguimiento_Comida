const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const userRouter = require('./routes/user.router')
const menuRouter = require('./routes/menu.router')
const handleErrors = require('./middleware/handleErrors')
const { author, license, name, description } = require('../package.json')

const app = express()

const whiteList = [ 'http://localhost:4200', 'https://master--seguimiento-comida-sofkau.netlify.app', 'https://seguimiento-comida-sofkau.netlify.app' ]
const corsOptions = {
    origin: whiteList,
    optionsSuccessStatus: 200
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('json spaces', 2)

app.get('/', (req, res) => {
    return res.send({ name, author, description, license })
})

app.use('/api/user', cors(corsOptions), userRouter)
app.use('/api/menu', cors(corsOptions), menuRouter)

app.use((req, res, next) => {
    return res.status(404).send('404 not found')
})

app.use(handleErrors)

module.exports = app