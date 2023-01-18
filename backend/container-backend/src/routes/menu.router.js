const menuController = require('../controller/menu.controller')
const menuRouter = require('express').Router()
const bodyParser = require('body-parser')
const { verifyToken } = require('../middleware/verifyToken')

menuRouter.use(bodyParser.urlencoded({ extended: true }))
menuRouter.post('/', verifyToken, menuController.create)
menuRouter.put('/', verifyToken, menuController.update)
menuRouter.delete('/:menuId', verifyToken, menuController.delete)

menuRouter.get('/', menuController.findAll)
menuRouter.get('/users', menuController.findUsersByMenu)
menuRouter.get('/id', menuController.findOneById)
menuRouter.get('/date', menuController.findOneByDate)

module.exports = menuRouter