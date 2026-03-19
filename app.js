const express = require("express");
const cors = require("cors");
const app = express();


app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']  // Add 'Authorization' to allowed headers
}));

app.use(express.json());


module.exports = app;