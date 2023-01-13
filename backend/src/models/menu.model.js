const { sequelize, Sequelize } = require(".");

module.exports = (sequelize, Sequelize) => {
    const Menu = sequelize.define("menu", {
        _id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        ingredientes: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            unique: true
        },
    })

    return Menu
}