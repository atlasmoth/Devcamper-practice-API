require("dotenv").config({
  path: "./config/config.env"
});
const fs = require("fs");
const mongoose = require("mongoose");
const Course = require("./models/course");

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true
  })
  .then(async () => {
    try {
      if (process.argv[2] === "--delete") {
        await Course.deleteMany({});
        console.log("Course collection is clean proceed");
        process.exit();
      } else if (process.argv[2] === "--seed") {
        const courses = JSON.parse(
          fs.readFileSync("./_data/courses.json", {
            encoding: "utf-8"
          })
        );

        await Course.create(courses);
        console.log("Courses successfully created chale");
        process.exit();
      }
    } catch (error) {
      throw error;
    }
  })
  .catch(e => console.log(e.message));
