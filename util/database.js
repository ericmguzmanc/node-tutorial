const mysql = require("mysql2");

// ℹ️ A connection pool manages multiple connections, we don't have to open and close connection for every query
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "node-complete",
    password: "Anna1621"
});

module.exports = pool.promise();