const { Sequelize } = require("sequelize");


const sequelize = new Sequelize("node-complete", "root", "Anna1621", {
    dialect: "mysql",
    host: "localhost",
});


module.exports = sequelize;
