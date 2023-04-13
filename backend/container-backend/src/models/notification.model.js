module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define("notification", {
        _id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        notificationTitle: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        message: {
            type: Sequelize.STRING
        },
        emisorSocketId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        receptorSocketId: {
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