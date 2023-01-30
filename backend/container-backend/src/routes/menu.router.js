const menuController = require('../controller/menu.controller')
const menuRouter = require('express').Router()
const bodyParser = require('body-parser')
const { verifyToken } = require('../middleware/verifyToken')

menuRouter.use(bodyParser.urlencoded({ extended: true }))

menuRouter.get('/', menuController.findAll)
menuRouter.get('/users/:menuId', menuController.findUsersByMenu)
menuRouter.get('/id/:menuId', menuController.findOneById)
menuRouter.get('/date/:date', menuController.findOneByDate)

module.exports = menuRouter