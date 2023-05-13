const menuServices = require('./services/menu.services')
const userServices = require('./services/user.services')
const notificationServices = require('./services/notification.service')
const jwt = require('jsonwebtoken')
const AppError = require('./middleware/AppError')
const { REQUIREDTOKEN, SERVER_ERROR, UNAUTHORIZED, ACCESS_DENIED, INVALID_DATA, INFO_NOT_FOUND, MISSING_DATA } = require('./middleware/errorCodes')
const handleSocketErrors = require('./middleware/handleSocketError')
const UsersInSocket = require('./services/usersInSocket')

//''            -1
//'ADMIN',      0
//'COCINERO'    1
//'COMENSAL',   2
//'All'         3

const onlineUsers = new UsersInSocket()

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('client:newUser', async (data) => {
            const { userId, email, userRol } = data
            onlineUsers.addNewUser(userId, email, socket.id, userRol)
            socket.join(parseInt(userRol))
            emitOnlineUsers()
        })

        socket.on('client:isConnected', async () => {
            emitIsConnected()
        })

        socket.on('client:requestMenus', async () => {
            emitMenues(await menuServices.getAllMenu())
        })

        socket.on('client:requestMenusOfMonth', async (data) => {
            const { month } = data
            try {
                const menusRes = await menuServices.getMenusOfMonth(month)
                if (menusRes.isError) throw new AppError(menusRes.errorCode, menusRes.details, menusRes.statusCode)

                emitMenues(menusRes.data)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:requestRol', async (data) => {
            // notificar a administradores la solicitud de rol
            // guardar en BD la notificación para mostrar cuando un admin se conecte
            const { createdTime } = data
            const emisorUser = onlineUsers.getUserBySocket(socket.id)

            const notification = {
                notificationTitle: "requestRol",
                message: `[${emisorUser.email}] esta solicitando un rol`,
                emisorId: emisorUser.userId,
                receptorId: undefined,
                receptorRol: 0,
                createdTime: createdTime,
                active: true
            }

            try {
                const notificationRes = await notificationServices.createNotification(notification)
                if (notificationRes.isError)
                    throw new AppError(notificationRes.errorCode, notificationRes.details, notificationRes.statusCode)

                emitNewNotificacion(notificationRes)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] Notificación: [${notificationRes._id}] creada`)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:requestNotifications', async (data) => {
            const { userId } = data
            let notifications = []

            try {
                if (!userId) throw new AppError(MISSING_DATA, 'userId es necesario', 404)
                const user = onlineUsers.getUserById(userId)

                const notificationsByReceptorIdRes = await notificationServices.getByReceptorId(userId)
                if (notificationsByReceptorIdRes.isError)
                    throw new AppError(notificationsByReceptorIdRes.errorCode, notificationsByReceptorIdRes.details, notificationsByReceptorIdRes.statusCode)

                notifications.push(...notificationsByReceptorIdRes.map(notification => notification.dataValues))

                const notificationsByRolRes = await notificationServices.getByReceptorRole(user.userRol)
                if (notificationsByRolRes.isError)
                    throw new AppError(notificationsByRolRes.errorCode, notificationsByRolRes.details, notificationsByRolRes.statusCode)

                notifications.push(...notificationsByRolRes.map(notification => notification.dataValues))

                emitNotifications(notifications, userId)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:notifyRoleChanged', async (data) => {
            const { receptorId, newRol, createdTime } = data
            const emisorUser = onlineUsers.getUserBySocket(socket.id)
            const ROLES = [
                'SIN ROL',
                'ADMINISTRADOR',
                'COCINERO',
                'COMENSAL',
            ]

            const notification = {
                notificationTitle: "notifyRoleChanged",
                message: `Su rol ha cambiado a [${ROLES[parseInt(newRol) + 1]}]`,
                emisorId: emisorUser.userId,
                receptorId: receptorId,
                receptorRol: undefined,
                createdTime: createdTime,
                active: true
            }

            try {
                const notificationRes = await notificationServices.createNotification(notification)
                if (notificationRes.isError) throw new AppError(notificationRes.errorCode, notificationRes.details, notificationRes.statusCode)

                emitNewNotificacion(notificationRes)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] Notificación: [${notificationRes._id}] creada`)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:requestMenusByUserId', async (data) => { //FRONTEND SOLICITA MENUS DEL CLIENTE
            const { token, userId } = data
            try {
                const tokenData = verifyToken(token)
                if (tokenData.isError) throw new AppError(tokenData.errorCode, tokenData.details, 400)

                const menusRes = await menuServices.getMenusByUserId(userId)
                if (menusRes.isError) throw new AppError(menusRes.errorCode, menusRes.details, menusRes.statusCode)

                socket.emit('server:loadMenusOfUser', menusRes.data)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        const emitMenues = (menus) => { //EMITE AL FRONTEND LOS MENUS
            socket.emit('server:menus', menus)
        }

        const emitOnlineUsers = () => {
            io.emit('server:onlineUsers', onlineUsers.getAllUsers().map(user => user.userId))
        }

        const emitNotifications = (notifications, userId) => {
            // Emite una lista de notificaciónes segun el userId
            const receptorSocketId = onlineUsers.getUserById(userId).socketId
            return io.to(receptorSocketId).emit('server:notifications', notifications)
        }

        const emitNewNotificacion = (notification) => {
            // Emite notificaciones de a una por vez

            if (notification.receptorId != undefined) {
                const receptor = onlineUsers.getUserById(notification.receptorId)
                if (!receptor) return

                const receptorSocketId = onlineUsers.getUserById(notification.receptorId).socketId
                return io.to(receptorSocketId).emit('server:newNotification', notification)
            }

            if (notification.receptorRol != undefined) {
                return io.to(parseInt(notification.receptorRol)).emit('server:newNotification', notification)
            }

            handleSocketErrors(new AppError(MISSING_DATA, `receptorId o receptorRol son necesarias`, 400), socket)
        }

        const emitIsConnected = () => {
            io.to(socket.id).emit('server:IsConnected', onlineUsers.users.some(user => user.socketId === socket.id))
        }

        socket.on('client:newMenu', async (data) => {
            try {
                const { token, menu } = data

                const tokenData = verifyToken(token)
                if (tokenData.isError) throw new AppError(tokenData.errorCode, tokenData.details, 400)

                const userData = await userServices.getUserById(tokenData.id)
                if (userData.isError) throw new AppError(menuData.errorCode, menuData.details, menuData.statusCode)

                user = userData.data.dataValues
                if (user.rol == null || user.rol == undefined || user.rol == -1 || user.rol > 1)
                    throw new AppError(UNAUTHORIZED, 'No tiene la autorización necesaria', 400)

                const { menuPrincipal, menuSecundario, date } = menu
                const menuData = await menuServices.createMenu(menuPrincipal, menuSecundario, date)
                if (menuData.isError) throw new AppError(menuData.errorCode, menuData.details, menuData.statusCode)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] Menú: [${menuData.data._id}] creado por [${tokenData.email}]`)
                io.emit('server:loadMenus')

            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:deleteMenu', async (data) => {
            try {
                const { token, menuId } = data

                const tokenData = verifyToken(token)
                if (tokenData.isError) throw new AppError(tokenData.errorCode, tokenData.details, 400)

                const userData = await userServices.getUserById(tokenData.id),
                    user = userData.data.dataValues
                if (user.rol == null || user.rol == undefined || user.rol == -1 || user.rol > 1) {
                    throw new AppError(UNAUTHORIZED, 'No tiene la autorización necesaria', 400)
                }

                const menuData = await menuServices.deleteMenu(menuId)
                if (menuData.isError) throw new AppError(menuData.errorCode, menuData.details, menuData.statusCode)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] Menú: [${menuId}] borrado por [${tokenData.email}]`)
                socket.emit('server:deletedMenu', true)
                io.emit('server:loadMenus')

            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:updateMenu', async (data) => {
            try {
                const { token, menu } = data

                const tokenData = verifyToken(token)
                if (tokenData.isError) {
                    throw new AppError(tokenData.errorCode, tokenData.details, 400)
                }

                const userData = await userServices.getUserById(tokenData.id),
                    user = userData.data.dataValues
                if (user.rol == null || user.rol == undefined || user.rol == -1 || user.rol > 1) {
                    throw new AppError(UNAUTHORIZED, 'No tiene la autorización necesaria', 400)
                }

                if (menu.menuPrincipal.length >= 255 || menu.menuSecundario.length >= 255) {
                    throw new AppError(INVALID_DATA, 'Cantidad de caracteres excedido', 400)
                }

                const menuDate = await menuServices.getMenuByDate(menu.date)
                if (menuDate.isError && menuDate.errorCode != INFO_NOT_FOUND) {
                    throw new AppError(menuDate.errorCode, menuDate.details, menuDate.statusCode)
                }
                if (!menuDate.isError && menuDate.data.dataValues._id != menu._id) {
                    throw new AppError(INVALID_DATA, 'Ya hay un menú registrado en esa fecha', 400)
                }

                const menuData = await menuServices.updateMenu(menu)
                if (menuData.isError) throw new AppError(menuData.errorCode, menuData.details, menuData.statusCode)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] Menú: [${menu._id}] actualizado por [${tokenData.email}]`)
                socket.emit('server:updatedMenu', true)

                io.emit('server:loadMenus')

            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:addToMenu', async (data) => {
            try {
                const { token, menuId, selectedMenu, entryDate } = data

                const tokenData = verifyToken(token)
                if (tokenData.isError)
                    throw new AppError(tokenData.errorCode, tokenData.details, 400)

                const userData = await userServices.getUserById(tokenData.id),
                    user = userData.data.dataValues
                if (user.rol == null || user.rol == undefined || user.rol == -1 || user.rol > 2) {
                    throw new AppError(UNAUTHORIZED, 'No tiene la autorización necesaria', 400)
                }

                const menuData = await userServices.enterToMenu(menuId, selectedMenu, tokenData.id, new Date(entryDate))
                if (menuData.isError) throw new AppError(menuData.errorCode, menuData.details, menuData.statusCode)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] User: [${tokenData.email}] se unió al menú [${menuId}][${selectedMenu}]`)
                // const menues = await menuServices.getAllMenu()
                socket.emit('server:addedMenu', true)
                io.emit('server:loadMenus')

            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:deleteToMenu', async (data) => {
            try {
                const { token, menuId, dropDate } = data

                const tokenData = verifyToken(token)
                if (tokenData.isError)
                    throw new AppError(tokenData.errorCode, tokenData.details, 400)

                const userData = await userServices.getUserById(tokenData.id),
                    user = userData.data?.dataValues
                if (user.rol == null || user.rol == undefined || user.rol == -1 || user.rol > 2) {
                    throw new AppError(UNAUTHORIZED, 'No tiene la autorización necesaria', 400)
                }

                const menuData = await userServices.dropToMenu(menuId, tokenData.id, new Date(dropDate))
                if (menuData.isError) throw new AppError(menuData.errorCode, menuData.details, menuData.statusCode)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] User: [${tokenData.email}] dado de baja del menú: [${menuId}]`)

                socket.emit('server:deletedToMenu', true)
                io.emit('server:loadMenus')
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:activeNotification', async (data) => {
            const { notificationId, userId } = data
            const user = onlineUsers.getUserById(userId)

            try {
                const notificationRes = await notificationServices.changeActive(notificationId)
                if (notificationRes.isError)
                    throw new AppError(notificationRes.errorCode, notificationRes.details, notificationRes.statusCode)

                io.to(user.socketId).emit('server:requestNotifications')

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] Notificación: [${notificationId}] actualizada`)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:deleteNotification', async (data) => {
            const { notificationId, userId } = data
            const user = onlineUsers.getUserById(userId)

            try {
                const notificationRes = await notificationServices.deleteNotification(notificationId)
                if (notificationRes.isError)
                    throw new AppError(notificationRes.errorCode, notificationRes.details, notificationRes.statusCode)

                io.to(user.socketId).emit('server:requestNotifications')

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] Notificación: [${notificationId}] eliminada`)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('disconnect', () => {
            onlineUsers.removeUser(socket.id)
            emitIsConnected()
            emitOnlineUsers()
        })
    })
}

verifyToken = (token) => {
    try {
        if (!token) {
            return {
                isError: true,
                errorCode: REQUIREDTOKEN,
                details: 'Token es necesario'
            }
        }
        if (!token.toLowerCase().startsWith('bearer')) {
            return {
                isError: true,
                errorCode: ACCESS_DENIED,
                details: 'Acceso denegado',
            }
        }
        const subToken = token.substring(7)
        return jwt.verify(subToken, process.env.SECRET)

    } catch (err) {
        return {
            isError: true,
            errorCode: SERVER_ERROR,
            details: err
        }
    }
}