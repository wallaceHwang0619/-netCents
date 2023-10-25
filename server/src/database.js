// This code is meant to provide a connection to the MySQL database

const mysql = require("mysql2");

// Creates a connection to the MySQL database (NetCents) run locally from my computer
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "NetCents",
  database: "NetCents",
});

// Establishes and checks for connection to MySQL server
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  }
  console.log("Connected to MySQL server");
});

module.exports = db;
