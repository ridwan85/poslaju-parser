"user strict";

var mysql = require("mysql");

//local mysql db connection
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "~p@ssW0rd123",
  database: "poslaju_parser"
});

connection.connect(function(err) {
  if (err) throw err;
});

module.exports = connection;
