const AppError = require('../middleware/AppError')
const menuServices = require('../services/menu.services')
const { tryCatch } = require('../services/tryCatch')

exports.findAll = tryCatch(async (req, res) => {
    const data = await menuServices.getAllMenu()
    res.status(200).send(data)
})

exports.findUsersByMenu = tryCatch(async (req, res) => {
    const { menuId } = req.params
    
    const data = await menuServices.getUsersOfMenu(menuId)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    const menu = data.data
    const users = menu.users.map(user => {
        return {
            _id: user._id,
            name: user.name,
            surName: user.surName,
            email: user.email,
            selectedMenu: user.Menu_User.selectedMenu
        }
    })
    return res.status(200).send(users)
})

exports.findOneById = tryCatch(async (req, res) => {
    const { menuId } = req.params
    
    const data = await menuServices.getMenuById(menuId)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)
    const menu = data.data
    return res.status(200).send(menu)
})

exports.findOneByDate = tryCatch(async (req, res) => {
    const { date } = req.params
    
    const data = await menuServices.getMenuByDate(date)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)
    const menu = data.data
    return res.status(200).send(menu)
})