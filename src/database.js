const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "NetCents",
  database: "NetCents",
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }

  console.log("Connected to MySQL server");

  // You can perform database queries here
  connection.query("SHOW TABLES;", function (err, results) {
    console.log(results);
  });
  // Release the connection when done
  connection.release();
});

// Handle errors
pool.on("error", (err) => {
  console.error("MySQL Pool Error:", err);
});

// Export the pool for use in other parts of your application
module.exports = pool;
