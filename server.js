const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "/config/config.env")
});

const morgan = require("morgan");
const bootcampRouter = require(path.join(__dirname, "/routes/bootcamp"));
const courseRouter = require(path.join(__dirname, "/routes/course"));
const authRouter = require(path.join(__dirname, "/routes/auth"));
const db = require(path.join(__dirname, "/config/db"));
const colors = require("colors");
const errorHandler = require("./controllers/error");
const express = require("express");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
// Express setup

const app = express();

// Setting up middleware
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
app.use(fileupload());
// Setting up routes
app.use("/api/v1/bootcamps", bootcampRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/auth", authRouter);
app.use(errorHandler);
db(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("MongoDB Connected".cyan.underline.bold);
    app.listen(process.env.PORT, () =>
      console.log(
        `We are listening on ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
          .yellow.bold
      )
    );
  })
  .catch(e => console.log(e.message.red));

process.on("unhandledRejection", err => {
  console.log(`Error : ${err.message}`.red);
  process.exit(1);
});
