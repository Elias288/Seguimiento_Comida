const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
require('./models')
const { author, license, name, description } = require('../package.json')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('json spaces', 2)

app.get('/', (req, res) => {
    res.send({ name, author, description, license })
})

app.get('/hello', (req, res) => {
    res.send('hello world')
})

module.exports = server

