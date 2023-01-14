const { sequelize, Sequelize } = require(".");

module.exports = (sequelize, Sequelize) => {
    const Menu = sequelize.define("menu", {
        _id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        menuPrincipal: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        menuSecundario: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            unique: true
        },
    })

    return Menu
}