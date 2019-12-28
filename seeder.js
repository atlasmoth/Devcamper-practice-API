require("dotenv").config({
  path: "./config/config.env"
});
const fs = require("fs");
const mongoose = require("mongoose");
const Bootcamp = require("./models/bootcamp");

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true
  })
  .then(async db => {
    try {
      if (process.argv[2] === "--delete") {
        await Bootcamp.deleteMany({});
        console.log("Bootcamp collection is clean proceed");
        process.exit();
      } else if (process.argv[2] === "--seed") {
        const bootcamps = JSON.parse(
          fs.readFileSync("./_data/bootcamps.json", {
            encoding: "utf-8"
          })
        );
        console.log(bootcamps);
        await Bootcamp.create(bootcamps);
        console.log("Bootcamps successfully created chale");
        process.exit();
      }
    } catch (error) {
      throw error;
    }
  })
  .catch(e => console.log(e.message));
