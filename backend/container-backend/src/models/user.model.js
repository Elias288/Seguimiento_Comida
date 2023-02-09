module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        _id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        surName: {
            type: Sequelize.STRING
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