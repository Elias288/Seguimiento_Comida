const menuServices = require('./services/menu.services')
const userServices = require('./services/user.services')
const notificationServices = require('./services/notification.service')
const jwt = require('jsonwebtoken')
const AppError = require('./middleware/AppError')
const { REQUIREDTOKEN, SERVER_ERROR, DEFAULT_ERROR, UNAUTHORIZED, ACCESS_DENIED, INVALID_DATA, INFO_NOT_FOUND } = require('./middleware/errorCodes')
const handleSocketErrors = require('./middleware/handleSocketError')

//''            -1
//'ADMIN',      0
//'COCINERO'    1
//'COMENSAL',   2
//'All'         3

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

        socket.on('client:requestMenues', () => {
            emitMenues()
        })

        /* const emitNewNotificacion = (userId, userRol, message) => {
            if (userId != "") {
                return
            }

            io.to(userRol).emit('server:newNotification', message)
        }
        
        socket.on('client:requestPersonalNotifications', async (data) => {
            const { userId, userRol } = data

            const userNotificaciones = await notificationServices.getByReceptor(userId)
            const rolNotificaciones = await notificationServices.getByReceptorRole(userRol)
            const emisorNotification = await notificationServices.getByEmisor(userId)
            // console.log(userId, userNotificaciones.length, rolNotificaciones.length, emisorNotification.length);
            

            const notifications = userNotificaciones.concat(rolNotificaciones).concat(emisorNotification)

            socket.emit('server:notifications', notifications)
        }) */
        
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

                console.log(`[${new Date()}] Menú: [${menuData.data._id}] creado por [${tokenData.email}]`)
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

                console.log(`[${new Date()}] Menú: [${menuId}] borrado por [${tokenData.email}]`)
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
    
                console.log(`[${new Date()}] Menú: [${menu._id}] actualizado por [${tokenData.email}]`)
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
    
                console.log(`[${new Date()}] User: [${tokenData.email}] se unió al menú [${menuId}]`)
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

                console.log(`[${new Date()}] User: [${tokenData.email}] dado de baja del menú: [${menuId}]`)
                const menues = await menuServices.getAllMenu()
                socket.emit('server:deletedToMenu', true)
                io.emit('server:loadMenues', menues)
            } catch (error) {
                handleSocketErrors(error, socket)
            }
        })

        /* socket.on('client:requestRol', async (data) => {
            // notificar a administradores la solicitud de rol
            // guardar en BD la notificación para mostrar cuando un admin se conecte

            const { token, emisor } = data
            const name = "requestRol", message = "solicitud de rol", receptorRol = 0
            
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
        }) */
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