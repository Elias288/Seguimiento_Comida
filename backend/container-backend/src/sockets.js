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

        socket.on('client:newMenu', (data) => {
            const { token, menu } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                console.error(new Error('tokenNotProvidedError'))
                return socket.emit('server:error', 'Token es necesario')
            }
            if (!checkRoles(tokenData)) {
                console.error(new Error('unauthorized'))
                return socket.emit('server:error', 'No tiene la autorización necesaria')
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

        socket.on('client:deleteMenu', (data) => {
            const { token, menuId } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                console.error(new Error('tokenNotProvidedError'))
                return socket.emit('server:error', 'Token es necesario')
            }
            if (!checkRoles(tokenData)) {
                console.error(new Error('unauthorized'))
                return socket.emit('server:error', 'No tiene la autorización necesaria')
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

        socket.on('client:updateMenu', (data) => {
            const { token, menu } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                console.error(new Error('tokenNotProvidedError'))
                return socket.emit('server:error', 'Token es necesario')
            }
            if (!checkRoles(tokenData)) {
                console.error(new Error('unauthorized'))
                return socket.emit('server:error', 'No tiene la autorización necesaria')
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

        socket.on('client:addToMenu', (data) => {
            const { token, menuId, selectedMenu } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                console.error(new Error('tokenNotProvidedError'))
                return socket.emit('server:error', 'Token es necesario')
            }
            if (!(tokenData.roles.includes(ROLES[0]) || tokenData.roles.includes(ROLES[1]))) {
                console.error(new Error('unauthorized'))
                return socket.emit('server:error', 'No tiene la autorización necesaria')
            }

            userServices.enterToMenu(menuId, selectedMenu, tokenData.id).then(async data => {
                if (data.isError) {
                    console.error(new Error(data.name))
                    return socket.emit('server:error', { ...data, message: 'Ya no es posible agendarse' })
                }

                const menues = await menuServices.getAllMenu()
                socket.emit('server:addedMenu', true)
                io.emit('server:loadMenues', menues)
            })
        })

        socket.on('client:deleteToMenu', (data) => {
            const { token, menuId } = data
            const tokenData = verifyToken(token)
            if (!tokenData) {
                console.error(new Error('tokenNotProvidedError'))
                return socket.emit('server:error', 'Token es necesario')
            }
            if (!(tokenData.roles.includes(ROLES[0]) || tokenData.roles.includes(ROLES[1]))) {
                console.error(new Error('unauthorized'))
                return socket.emit('server:error', 'No tiene la autorización necesaria')
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
        console.error(new Error('tokenNotProvidedError'))
        return socket.emit('server:error','Token es requerido')
    }
    if (!token.toLowerCase().startsWith('bearer')) {
        console.error(new Error('accessDenied'))
        return socket.emit('server:error', 'Acceso denegado')
    }

    try {
        const subToken = token.substring(7)
        return jwt.verify(subToken, process.env.SECRET)
    } catch (error) {
        console.error(new Error(error.name))
        return socket.emit('server:error', error)
    }
}

checkRoles = (token) => {
    return token.roles.includes(ROLES[2]) || token.roles.includes(ROLES[0])
}