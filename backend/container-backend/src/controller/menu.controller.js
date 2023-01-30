const menuServices = require('../services/menu.services')

const ROLES = [
    'ADMIN',
    'COMENSAL',
    'COCINERO'
]

exports.findAll = async (req, res, next) => {
    return menuServices.getAllMenu().then(data => {
        res.status(200).send(data)
    }).catch(error => {
        next(error)
    })
}

exports.findUsersByMenu = (req, res, next) => {
    const { menuId } = req.params
    
    return menuServices.getUsersOfMenu(menuId).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
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
}

exports.findOneById = (req, res, next) => {
    const { menuId } = req.params
    
    return menuServices.getMenuById(menuId).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        const menu = data.data
        return res.status(200).send(menu)
    })
}

exports.findOneByDate = (req, res, next) => {
    const { date } = req.params
    
    return menuServices.getMenuByDate(date).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        const menu = data.data
        return res.status(200).send(menu)
    })
}

checkRoles = (user) => {
    return user.roles.includes(ROLES[2]) || user.roles.includes(ROLES[0])
}