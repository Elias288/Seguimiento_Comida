const dbConfig = require("../config/db.config.js")
// console.log(dbConfig);
const Sequelize = require("sequelize")
const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        operatorsAliases: 0,
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        },
        logging: false
    }
)

const db = {};

db.Sequelize = Sequelize
db.sequelize = sequelize

db.User = require("./user.model.js")(sequelize, Sequelize)
db.Menu = require("./menu.model.js")(sequelize, Sequelize)
db.Notification = require("./notification.model.js")(sequelize, Sequelize)

db.Menu_User = sequelize.define('Menu_User', {
    selectedMenu: { type: Sequelize.STRING },
    entryDate: { type: Sequelize.DATE }
}, { timestamps: false })

db.User.belongsToMany(db.Menu, { through: 'Menu_User' })
db.Menu.belongsToMany(db.User, { through: 'Menu_User' })

db.User.hasMany(db.Menu_User);
db.Menu_User.belongsTo(db.User);
db.Menu.hasMany(db.Menu_User);
db.Menu_User.belongsTo(db.Menu);

db.User.hasOne(db.Notification, {
    foreignKey: 'emisor'
})
db.Notification.belongsTo(db.User, {
    foreignKey: 'emisor'
})

module.exports = db