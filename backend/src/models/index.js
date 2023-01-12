const dbConfig = require("../config/db.config.js")

const Sequelize = require("sequelize")
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    }
  }
)

const db = {};

db.Sequelize = Sequelize
db.sequelize = sequelize

db.User = require("./user.model.js")(sequelize, Sequelize)
db.Menu = require("./menu.model.js")(sequelize, Sequelize)

db.Menu_User = sequelize.define('Menu_User', {}, { timestamps: false })

db.User.belongsToMany(db.Menu, { through: 'Menu_User' })
db.Menu.belongsToMany(db.User, { through: 'Menu_User' })

db.User.hasMany(db.Menu_User);
db.Menu_User.belongsTo(db.User);
db.Menu.hasMany(db.Menu_User);
db.Menu_User.belongsTo(db.Menu);

module.exports = db