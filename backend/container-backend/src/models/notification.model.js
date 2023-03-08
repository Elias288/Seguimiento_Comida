module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define("notification", {
        _id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        message: {
            type: Sequelize.STRING
        },
        emisor: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        receptor: {
            type: Sequelize.STRING
        },
        receptorRole: {
            type: Sequelize.STRING
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    })

    return Notification
}