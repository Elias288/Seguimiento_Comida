const menuServices = require('./services/menu.services')
const userServices = require('./services/user.services')
const notificationServices = require('./services/notification.service')
const jwt = require('jsonwebtoken')
const AppError = require('./middleware/AppError')
const { REQUIREDTOKEN, SERVER_ERROR, UNAUTHORIZED, ACCESS_DENIED, INVALID_DATA, INFO_NOT_FOUND } = require('./middleware/errorCodes')
const handleSocketErrors = require('./middleware/handleSocketError')
const UsersInSocket = require('./services/usersInSocket')
const { MISSING_DATA } = require('./middleware/errorCodes')

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

        socket.on('client:requestMenues', () => {
            emitMenues()
        })

        socket.on('client:requestRol', async (data) => {
            // notificar a administradores la solicitud de rol
            // guardar en BD la notificación para mostrar cuando un admin se conecte
            const { createdTime } = data
            const emisorUser = onlineUsers.getUserBySocket(socket.id)
            const adminUsers = onlineUsers.getUsersByRol(0)

            const notification = {
                notificationTitle: "requestRol",
                message: `[${emisorUser.email}] esta solicitando un rol`,
                emisorSocketId: socket.id,
                receptorId: undefined,
                receptorRol: 0,
                createdTime: createdTime,
                active: true
            }

            if (adminUsers.length > 0) {
                emitNewNotificacion(notification)
            }

            try {
                const notificationRes = await notificationServices.createNotification(notification)
                if (notification.isError) throw new AppError(notificationRes.errorCode, notificationRes.details, notificationRes.statusCode)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}] Notificación: [${notificationRes._id}] creada`)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:requestNotifications', async (data) => {
            const { userId, userRol } = data
            let notifications = []

            // console.log(data);
            try {
                if (userId) {
                    const notificationsByReceptorIdRes = await notificationServices.getByReceptorId(userId)
                    if (notificationsByReceptorIdRes.isError) throw new AppError(notificationsByReceptorIdRes.errorCode, notificationsByReceptorIdRes.details, notificationsByReceptorIdRes.statusCode)
                    notifications.push(...notificationsByReceptorIdRes.map(notification => notification.dataValues)) 
                }
                if (userRol) {
                    const notificationsByRolRes = userRol && await notificationServices.getByReceptorRole(userRol)
                    if (notificationsByRolRes.isError) throw new AppError(notificationsByRolRes.errorCode, notificationsByRolRes.details, notificationsByRolRes.statusCode)
                    notifications.push(...notificationsByRolRes.map(notification => notification.dataValues))
                }
                
                notifications.forEach(notification => {
                    emitNewNotificacion(notification)
                })
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        socket.on('client:notifyRoleChanged', async (data) => {
            const { receptorId, newRol, createdTime } = data
            const ROLES = [
                'SIN ROL',
                'ADMINISTRADOR',
                'COCINERO',
                'COMENSAL',
            ]

            const notification = {
                notificationTitle: "notifyRoleChanged",
                message: `Su rol ha cambiado a [${ROLES[parseInt(newRol) + 1]}]`,
                emisorSocketId: socket.id,
                receptorId: receptorId,
                receptorRol: undefined,
                createdTime: createdTime,
                active: true
            }

            if (receptorId) {
                return emitNewNotificacion(notification)
            }
        })

        const emitMenues = async () => {
            const menues = await menuServices.getAllMenu()
            socket.emit('server:loadMenues', menues)
        }

        const emitOnlineUsers = () => {
            io.emit('server:onlineUsers', onlineUsers.getAllUsers().map(user => user.userId))
        }

        const emitNewNotificacion = (notification) => {
            if (notification.receptorId) {
                const receptorSocketId = onlineUsers.getUserById(notification.receptorId).socketId
                return io.to(receptorSocketId).emit('server:newNotification', notification)
            }

            if (notification.receptorRol) {
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

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}] Menú: [${menuData.data._id}] creado por [${tokenData.email}]`)
                io.emit("server:newMenu", menuData.data)

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

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}] Menú: [${menuId}] borrado por [${tokenData.email}]`)
                socket.emit('server:deletedMenu', true)
                const menues = await menuServices.getAllMenu()
                io.emit('server:loadMenues', menues)

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
    
                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}] Menú: [${menu._id}] actualizado por [${tokenData.email}]`)
                socket.emit('server:updatedMenu', true)
                const menues = await menuServices.getAllMenu()
                io.emit('server:loadMenues', menues)
                
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
    
                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}] User: [${tokenData.email}] se unió al menú [${menuId}]`)
                const menues = await menuServices.getAllMenu()
                socket.emit('server:addedMenu', true)
                io.emit('server:loadMenues', menues)

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
                if (user.rol == null || user.rol == undefined || user.rol == -1 ||  user.rol > 2) { 
                    throw new AppError(UNAUTHORIZED, 'No tiene la autorización necesaria', 400)
                }
    
                const menuData = await userServices.dropToMenu(menuId, tokenData.id, new Date(dropDate))
                if (menuData.isError) throw new AppError(menuData.errorCode, menuData.details, menuData.statusCode)

                console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo' })}] User: [${tokenData.email}] dado de baja del menú: [${menuId}]`)
                const menues = await menuServices.getAllMenu()
                socket.emit('server:deletedToMenu', true)
                io.emit('server:loadMenues', menues)
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