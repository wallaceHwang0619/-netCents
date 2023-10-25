// This code is meant to store the largest unconfirmed transactions received from the 'BlockCypher' API, handle user authentication, as well as create an API endpoint to see the data.

const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const db = require("./database");
const session = require("express-session");
const cors = require("cors");

const app = express();

// Store information of current session for user authentication (Line 13 - 28)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use(
  session({
    secret: "netCents",
    resave: false,
    saveUninitialized: true,
  })
);

// Keep track of largest transaction every time the script is re-run
let largestTransaction = null;

// BlockCypher API
const blockcypherAPI = "https://api.blockcypher.com/v1/btc/main/txs";

// Function for finding the largest transaction by 'Total' in a list of unconfirmed transactions.
function findLargestTransaction(transactions) {
  let largest = null;
  transactions.forEach((transaction) => {
    if (!largest || transaction.total > largest.total) {
      largest = transaction;
    }
  });
  return largest;
}

// Function for storing the largest found transaction into the MySQL datbase (Specifically, 'largest_unconfirmed_transactions' table)
function storeLargestTransaction(transaction) {
  const sql =
    "INSERT INTO largest_unconfirmed_transactions (hash, total, fees, inputs, outputs) VALUES (?, ?, ?, ?, ?)";
  const values = [
    transaction.hash,
    transaction.total,
    transaction.fees,
    JSON.stringify(transaction.inputs),
    JSON.stringify(transaction.outputs),
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error storing transaction:", err);
    } else {
      console.log("Transaction stored:", result);
    }
  });
}

// Function that creates a GET request from the BlockCypher API, which then executes code to find largest unconfirmed transaction.
function monitorTransactions() {
  fetch(blockcypherAPI)
    .then((response) => response.json())
    .then((data) => {
      const unconfirmedTransactions = data;
      if (data.length) {
        largestTransaction = findLargestTransaction(unconfirmedTransactions);
        storeLargestTransaction(largestTransaction);
      } else {
        console.log("No unconfirmed transactions found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching unconfirmed transactions:", error);
    });
}

// Executes 'monitorTransactions' function every 5 minutes
setInterval(monitorTransactions, 300000);

// Permits POST requests for registering as a user in the database
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (username.length === 0 || password.length === 0) {
    return res.json({
      error: "Username or password field must contain values.",
    });
  }

  const userQuery = `SELECT * FROM Users WHERE username = "${username}"`;

  db.query(userQuery, (err, result) => {
    if (err) {
      return res.json({ error: `Database error: ${err}` });
    }

    const existingUserResults = result;
    if (existingUserResults.length) {
      return res.json({
        error: "Username already exists. Please try another username.",
      });
    } else {
      const createUser = `INSERT INTO Users (username, password) Values ("${username}", "${password}")`;

      db.query(createUser, (err, result) => {
        if (err) {
          return res.json({
            error: `Database error, cannot store user: ${err}`,
          });
        }
        return res.json({
          message: "User registered successfully",
        });
      });
    }
  });
});

// Permits POST requests for logging into the database
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const userAuthQuery = `SELECT * FROM users WHERE username = "${username}" AND password = "${password}"`;
  db.query(userAuthQuery, (err, result) => {
    if (err) {
      return res.json({ error: `Database error: ${err}` });
    }

    const userAuth = result;
    if (userAuth.length) {
      req.session.user = username; // Saves username from current session to authenticate user
      req.session.save();
      return res.json({ message: "Login Successful" });
    } else {
      return res.json({ error: "Invalid credentials" });
    }
  });
});

// Authenticates a user based on success of their login
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    return res.json({ error: "Unauthorized user" });
  }
}

// Permits GET requests from database to obtain the list of largest unconfirmed transactions
app.get("/api/largest-transaction", isAuthenticated, (req, res) => {
  db.query("SELECT * FROM largest_unconfirmed_transactions", (err, result) => {
    if (err) {
      return res.json({ error: "Database Error" });
    }

    if (result.length) {
      return res.json(result);
    } else {
      return res.json({ error: "No transactions in table." });
    }
  });
});

// Establishes API server
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});
