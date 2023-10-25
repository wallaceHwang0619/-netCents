const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "NetCents",
  database: "NetCents",
});

// Test the connection
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  }
  console.log("Connected to MySQL server");
});

module.exports = db;
