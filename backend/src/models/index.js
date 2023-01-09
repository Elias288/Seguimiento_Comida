const dbConfig = require("../config/db.config.js")

// console.log('database in:',dbConfig.HOST, dbConfig.port)
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

// sequelize.authenticate().then(() => {
//   console.log('BD conectada')
// }).catch((error) => {
//   console.log('error: ', error)
// })

db.Sequelize = Sequelize
db.sequelize = sequelize

db.User = require("./user.model.js")(sequelize, Sequelize)

module.exports = db