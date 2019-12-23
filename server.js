const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "/config/config.env")
});
// Express setup
const express = require("express");
const app = express();
app.use(express.json());
app.listen(process.env.PORT, () =>
  console.log(
    `We are listening on ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  )
);
