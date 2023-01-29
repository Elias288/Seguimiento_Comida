const menuServices = require('../services/menu.services')

const ROLES = [
    'ADMIN',
    'COMENSAL',
    'COCINERO'
]

exports.create = (req, res, next) => {
    const { menuPrincipal, menuSecundario, date } = req.body
    const { tokenData } = req
    
    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!checkRoles(tokenData)) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }
    
    menuServices.createMenu(menuPrincipal, menuSecundario, date).then(data => {
        if (data.isError){
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send(data.data)
    })
}

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

exports.update = (req, res, next) => {
    const { menuPrincipal, menuSecundario, date, _id } = req.body
    const { tokenData } = req
    
    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!checkRoles(tokenData)) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }

    const menu = {  menuPrincipal, menuSecundario, date, _id }
    return menuServices.updateMenu(menu).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send({ message: 'Menu actualizado' })
    })
}

exports.delete = (req, res, next) => {
    const { menuId } = req.params
    const { tokenData } = req
    
    if (!tokenData) {
        console.error(new Error('tokenNotProvidedError'))
        return next({ name: "tokenNotProvidedError" })
    }
    if (!checkRoles(tokenData)) {
        console.error(new Error('unauthorized'))
        return next({ name: "unauthorized" })
    }

    return menuServices.deleteMenu(menuId).then(data => {
        if (data.isError) {
            console.error(new Error(data.name))
            return next(data)
        }
        return res.status(200).send({ message: 'Menu eliminado' })
    })
}

checkRoles = (token) => {
    return token.roles.includes(ROLES[2]) || token.roles.includes(ROLES[0])
}