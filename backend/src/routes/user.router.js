const userControler = require('../controller/user.controller')
const userRouter = require('express').Router()
const bodyParser = require('body-parser')

userRouter.use(bodyParser.urlencoded({ extended: true }))
userRouter.post('/', userControler.create)
userRouter.get('/email', userControler.findOneByEmail)
userRouter.get('/id', userControler.findOneById)

module.exports = userRouter