const menuServices = require('./services/menu.services')
const userServices = require('./services/user.services')
const jwt = require('jsonwebtoken')

const ROLES = [
    'ADMIN',
    'COMENSAL',
    'COCINERO'
]

module.exports = (io) => {
    io.on('connection', (socket) => {
        // console.log('new user connected:', socket.id);

        const emitMenues = async () => {
            const menues = await menuServices.getAllMenu()
            socket.emit('server:loadMenues', menues)
        }
        emitMenues()

        socket.on('client:newMenu', async (data) => {
            const { token, menu } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                return socket.emit('server:error', { message: 'Token es necesario'})
            }
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (!checkRoles(user)) {
                return socket.emit('server:error', { message: 'No tiene la autorización necesaria'})
            }

            const { menuPrincipal, menuSecundario, date } = menu
            menuServices.createMenu(menuPrincipal, menuSecundario, date).then(data => {
                if (data.isError){
                    console.error(new Error(data.name))
                    return socket.emit('server:error', data)
                }
                io.emit("server:newMenu", data.data)
            })
        })

        socket.on('client:deleteMenu', async (data) => {
            const { token, menuId } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                return socket.emit('server:error', { message: 'Token es necesario'})
            }
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (!checkRoles(user)) {
                return socket.emit('server:error', { message: 'No tiene la autorización necesaria'})
            }
            menuServices.deleteMenu(menuId).then(async data => {
                if (data.isError) {
                    console.error(new Error(data.name))
                    return socket.emit('server:error', data)
                }

                socket.emit('server:deletedMenu', true)
                const menues = await menuServices.getAllMenu()
                io.emit('server:loadMenues', menues)
            })
        })

        socket.on('client:updateMenu', async (data) => {
            const { token, menu } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                return socket.emit('server:error', { message: 'Token es necesario'})
            }
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (!checkRoles(user)) {
                return socket.emit('server:error', { message: 'No tiene la autorización necesaria' })
            }
            if (menu.menuPrincipal.length >= 255 || menu.menuSecundario.length >= 255){
                return socket.emit('server:error', { message: 'Cantidad de caracteres excedido' })
            }
            menuServices.updateMenu(menu).then(async data => {
                if (data.isError) {
                    console.error(new Error(data.name))
                    return socket.emit('server:error', data)
                }

                socket.emit('server:updatedMenu', true)
                const menues = await menuServices.getAllMenu()
                io.emit('server:loadMenues', menues)
            })
        })

        socket.on('client:addToMenu', async (data) => {
            const { token, menuId, selectedMenu } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                return socket.emit('server:error', { message: 'Token es necesario'})
            }
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (user.roles.length == 0) {
                return socket.emit('server:error', { message: 'No tiene la autorización necesaria'})
            }

            userServices.enterToMenu(menuId, selectedMenu, tokenData.id).then(async data => {
                if (data.isError) {
                    console.error(new Error(data.name))
                    return socket.emit('server:error', data)
                }

                const menues = await menuServices.getAllMenu()
                socket.emit('server:addedMenu', true)
                io.emit('server:loadMenues', menues)
            })
        })

        socket.on('client:deleteToMenu', async (data) => {
            const { token, menuId } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                return socket.emit('server:error', { message: 'Token es necesario'})
            }
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data?.dataValues
            if (!(user.roles.includes(ROLES[0]) || user.roles.includes(ROLES[1]))) {
                return socket.emit('server:error', { message: 'No tiene la autorización necesaria'})
            }

            userServices.dropToMenu(menuId, tokenData.id).then(async data => {
                if (data.isError) {
                    console.error(new Error(data.name))
                    return socket.emit('server:error', data)
                }

                socket.emit('server:deletedToMenu', true)
                const menues = await menuServices.getAllMenu()
                io.emit('server:loadMenues', menues)
            })
        })
    })
}

verifyToken = (token) => {
    if (!token) {
        return socket.emit('server:error','Token es requerido')
    }
    if (!token.toLowerCase().startsWith('bearer')) {
        return socket.emit('server:error', { message: 'Acceso denegado'})
    }

    try {
        const subToken = token.substring(7)
        return jwt.verify(subToken, process.env.SECRET)
    } catch (error) {
        console.error(new Error(error.name))
        return socket.emit('server:error', error)
    }
}

checkRoles = (user) => {
    return user.roles.includes(ROLES[2]) || user.roles.includes(ROLES[0])
}