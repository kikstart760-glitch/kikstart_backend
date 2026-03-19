const mongoose = require("mongoose");
const dotenv = require("dotenv");
require('dns').setDefaultResultOrder('ipv4first');




dotenv.config({ path: "./config.env" });

const app = require("./app");
const port = process.env.PORT || 6000; // fallback if PORT not set

const DB = process.env.DATABASE;
mongoose.connect(DB)
  .then(() => {
    console.log("DB connection Successful!!");
  })
  .catch((err) => {
    console.error("DB connection Failed:", err.message);
  });

app.listen(port, () => {
  console.log(`App is running at ${port}...`);
});

