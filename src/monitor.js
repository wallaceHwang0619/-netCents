const express = require("express");
const fetch = require("node-fetch");

const app = express();

let largestTransaction = null;

fetch("https://api.blockcypher.com/v1/btc/main/txs")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("Error fetching unconfirmed transactions:", error);
  });
