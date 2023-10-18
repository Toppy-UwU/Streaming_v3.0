const mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'localhost:3306',
  user: 'potty',
  password: 'p@ss',
  database: 'streaming_test'
});

module.exports = conn;