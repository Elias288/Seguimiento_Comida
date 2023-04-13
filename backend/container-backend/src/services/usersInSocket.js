
class UsersInSocket {
    users = []

    constructor(){}

    addNewUser (userId, email, socketId) {
        !this.users.some(user => user.email === email || user.userId === userId) && 
        this.users.push({ userId, email, socketId})

        if (process.env.DEV)
            console.log(`usuario agregado: [${userId}][${socketId}]`);
    }

    getUserByEmail(email) {
        return this.users.find(user => user.email === email)
    }

    getUserById(id) {
        return this.users.find(user => user.userId === id)
    }

    getAllUsers () {
        return this.users
    }

    removeUser(socketId) {
        this.users = this.users.filter((user) => user.socketId !== socketId)

        if (process.env.DEV)
            console.log(`usuario eliminado: [${socketId}]`);
    }
}

module.exports = UsersInSocket