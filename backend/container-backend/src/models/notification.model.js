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
        receptorId: {
            type: Sequelize.STRING
        },
        receptorRol: {
            type: Sequelize.STRING
        },
        active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        createdTime: {
            type: Sequelize.DATE
        }
    })

    return Notification
}