const menuServices = require('./services/menu.services')
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
                console.error(new Error('tokenNotProvidedError'))
                return null
            }
            if (!checkRoles(tokenData)) {
                console.error(new Error('unauthorized'))
                return null
            }

            const { menuPrincipal, menuSecundario, date } = menu
            menuServices.createMenu(menuPrincipal, menuSecundario, date).then(data => {
                if (data.isError){
                    console.error(new Error(data.name))
                    return null
                }
                io.emit("server:newMenu", data.data)
            })
        })
    })
}

verifyToken = (token) => {
    if (!token) {
        console.error(new Error('tokenNotProvidedError'))
        return null
    }
    if (!token.toLowerCase().startsWith('bearer')) {
        console.error(new Error('accessDenied'))
        return null
    }

    try {
        const subToken = token.substring(7)
        return jwt.verify(subToken, process.env.SECRET)
    } catch (error) {
        console.error(new Error(error.name))
        return null
    }
}

checkRoles = (token) => {
    return token.roles.includes(ROLES[2]) || token.roles.includes(ROLES[0])
}