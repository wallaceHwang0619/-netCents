const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const db = require("./database");
const session = require("express-session");
const cors = require("cors");

const app = express();

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

let largestTransaction = null;

const blockcypherAPI = "https://api.blockcypher.com/v1/btc/main/txs";

db.query("SHOW TABLES", (err, results) => {
  if (err) {
    console.error("Error with SQL query", err);
  } else {
    console.log(results);
  }
});

function findLargestTransaction(transactions) {
  let largest = null;
  transactions.forEach((transaction) => {
    if (!largest || transaction.total > largest.total) {
      largest = transaction;
    }
  });
  return largest;
}

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

setInterval(monitorTransactions, 300000);

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  const userQuery = `SELECT * FROM Users WHERE username = "${username}"`;

  db.query(userQuery, (err, result) => {
    if (err) {
      return res.json({ message: `Database error: ${err}` });
    }

    const existingUserResults = result;
    if (existingUserResults.length) {
      return res.json({
        message: "Username already exists. Please try another username.",
      });
    } else {
      const createUser = `INSERT INTO Users (username, password) Values ("${username}", "${password}")`;

      db.query(createUser, (err, result) => {
        if (err) {
          return res.json({
            message: `Database error, cannot store user: ${err}`,
          });
        }
        return res.json({
          message: "User registered successfully",
        });
      });
    }
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const userAuthQuery = `SELECT * FROM users WHERE username = "${username}" AND password = "${password}"`;
  db.query(userAuthQuery, (err, result) => {
    if (err) {
      return res.json({ message: `Database error: ${err}` });
    }

    const userAuth = result;
    if (userAuth.length) {
      req.session.user = username;
      req.session.save();
      return res.json({ message: "Login Successful" });
    } else {
      return res.json({ error: "Invalid credentials" });
    }
  });
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    console.log("User is not authenticated");
    return res.json({ error: "Unauthorized user" });
  }
}

app.get("/api/largest-transaction", isAuthenticated, (req, res) => {
  db.query("SELECT * FROM largest_unconfirmed_transactions", (err, result) => {
    if (err) {
      return res.json({ error: "Database Error" });
    }

    if (result.length) {
      return res.json(result);
    } else {
      return res.json({ message: "No transactions in table." });
    }
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});
