const express = require('express')
const http = require('http')
const cors = require('cors')
const db = require('./models')
const bodyParser = require('body-parser')
const { author, license, name, description } = require('../package.json')
const userRouter = require('./routes/user.router')
const menuRouter = require('./routes/menu.router')
const handleErrors = require('./middleware/handleErrors')

const app = express()
const server = http.createServer(app)

const whiteList = [ 'http://localhost:4200', 'https://master--seguimiento-comida-sofkau.netlify.app', 'https://seguimiento-comida-sofkau.netlify.app' ],
corsOptions = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: "GET,PUT,POST,DELETE"
  }

// app.use(cors(corsOptions))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('json spaces', 2)

db.sequelize.sync({ alter: true }).then(() => {
    console.log('db connected')
}).catch(err => {
    console.log('error', err)
})

app.get('/', (req, res) => {
    return res.send({ name, author, description, license })
})

app.use('/api/user', cors(corsOptions), userRouter)
app.use('/api/menu', cors(corsOptions), menuRouter)

app.use((req, res, next) => {
    console.log('notFound')
    return res.status(404).send('404 not found')
})
app.use(handleErrors)

module.exports = server