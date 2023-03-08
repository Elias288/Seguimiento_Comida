const userControler = require('../controller/user.controller')
const userRouter = require('express').Router()
const bodyParser = require('body-parser')
const { verifyToken } = require('../middleware/verifyToken')

userRouter.use(bodyParser.urlencoded({ extended: true }))

userRouter.post('/', userControler.create)
userRouter.post('/login', userControler.login)
userRouter.delete('/:userId', verifyToken, userControler.delete)

userRouter.put('/', verifyToken, userControler.update)
userRouter.put('/addRol', verifyToken, userControler.addRole)

userRouter.get('/', verifyToken, userControler.findAll)
userRouter.get('/confirm/:token', userControler.confirmEmail)
userRouter.get('/email/:email', verifyToken, userControler.findOneByEmail)
userRouter.get('/id/:id', verifyToken, userControler.findOneById)
userRouter.get('/me', verifyToken, userControler.getMe)

module.exports = userRouter