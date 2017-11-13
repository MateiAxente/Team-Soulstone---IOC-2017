// Update with your config settings.
var enviroment = require('dotenv').config()

module.exports = {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
};

