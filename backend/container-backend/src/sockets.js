const menuServices = require('./services/menu.services')
const userServices = require('./services/user.services')
const notificationServices = require('./services/notification.service')
const jwt = require('jsonwebtoken')

//'All'         0
//'ADMIN',      1
//'COCINERO'    2
//'COMENSAL',   3
//''            4

module.exports = (io) => {
    io.on('connection', (socket) => {
        // console.log('new user connected:', socket.id);

        socket.on('client:joinToRoom', (userRol) => {
            socket.join(userRol)
        })

        const emitMenues = async () => {
            const menues = await menuServices.getAllMenu()
            socket.emit('server:loadMenues', menues)
        }

        const emitNewNotificacion = (userId, userRol, message) => {
            if (userId != "") {
                return
            }

            io.to(userRol).emit('server:newNotification', message)
        }
        
        socket.on('client:requestMenues', () => {
            emitMenues()
        })

        socket.on('client:requestPersonalNotifications', async (data) => {
            const { userId, userRol } = data

            const userNotificaciones = await notificationServices.getByReceptor(userId)
            const rolNotificaciones = await notificationServices.getByReceptorRole(userRol)
            const emisorNotification = await notificationServices.getByEmisor(userId)
            // console.log(userId, userNotificaciones.length, rolNotificaciones.length, emisorNotification.length);
            

            const notifications = userNotificaciones.concat(rolNotificaciones).concat(emisorNotification)

            socket.emit('server:notifications', notifications)
        })

        socket.on('client:newMenu', async (data) => {
            const { token, menu } = data
            const tokenData = verifyToken(token)
            if (tokenData.isError){
                return socket.emit('server:error', { message: res.message })
            }
            
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (user.rol > 2) {
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
            if (tokenData.isError){
                return socket.emit('server:error', { message: res.message })
            }
            
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (user.rol > 2) {
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
            if (tokenData.isError){
                return socket.emit('server:error', { message: res.message })
            }
            
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (user.rol > 2) {
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
            if (tokenData.isError){
                return socket.emit('server:error', { message: res.message })
            }
            
            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data.dataValues
            if (user.rol > 3) {
                return socket.emit('server:error', { message: 'No tiene la autorización necesaria'})
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

        socket.on('client:deleteToMenu', async (data) => {
            const { token, menuId } = data
            const tokenData = verifyToken(token)
            if (tokenData.isError){
                return socket.emit('server:error', { message: res.message })
            }

            const userData = await userServices.getUserById(tokenData.id),
            user = userData.data?.dataValues
            if (!(user.rol > 3)) {
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

        socket.on('client:requestRol', async (data) => {
            // notificar a administradores la solicitud de rol
            // guardar en BD la notificación para mostrar cuando un admin se conecte

            const { token, emisor } = data
            const name = "requestRol", message = "solicitud de rol", receptorRol = 1
            
            const tokenData = verifyToken(token)
            if (tokenData.isError){
                return socket.emit('server:error', { message: res.message })
            }

            const creationResult = await notificationServices.createNotification(name, message, emisor._id, "", receptorRol)
            if (creationResult.isError) {
                console.error(new Error(creationResult.name))
                return socket.emit('server:error', creationResult)
            }

            emitNewNotificacion("", "ADMIN", creationResult.notification)
        })
    })
}

verifyToken = (token) => {
    if (!token) {
        return {
            isError: true,
            message: 'Token es necesario'
        }
    }
    if (!token.toLowerCase().startsWith('bearer')) {
        return {
            isError: true,
            message: 'Acceso denegado'
        }
    }

    try {
        const subToken = token.substring(7)
        return jwt.verify(subToken, process.env.SECRET)
    } catch (error) {
        console.error(new Error(error.name))
        return {
            isError: true,
            error
        }
    }
}