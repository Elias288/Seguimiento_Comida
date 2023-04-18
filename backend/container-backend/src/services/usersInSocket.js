
class UsersInSocket {
    users = []

    constructor(){}

    addNewUser (userId, email, socketId, userRol) {
        !this.users.some(user => user.email === email || user.userId === userId) && 
        this.users.push({ userId, email, socketId, userRol })

        if (process.env.DEV)
            console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] usuario agregado: [${userId}][${socketId}][${userRol}]`);
    }

    getUserBySocket(socketId) {
        return this.users.find(user => user.socketId === socketId)
    }

    getUserById(id) {
        return this.users.find(user => user.userId === id)
    }
    
    getUsersByRol(rol) {
        return this.users.filter(user => parseInt(user.userRol) === rol)
    }

    getAllUsers () {
        return this.users
    }

    removeUser(socketId) {
        this.users = this.users.filter((user) => user.socketId !== socketId)

        if (process.env.DEV)
            console.log(`[${new Date().toLocaleString('es-US', { timeZone: 'America/Montevideo', hour12: false })}] usuario eliminado: [${socketId}]`);
    }
}

module.exports = UsersInSocket