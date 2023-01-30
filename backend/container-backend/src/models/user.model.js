module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        _id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        surName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        emailVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        roles: {
            type: Sequelize.JSON
        }
    })

    return User
}