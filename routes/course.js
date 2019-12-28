const express = require("express");
const path = require("path");
const { getCourses, getCourse } = require(path.join(
  __dirname,
  "/../controllers/course"
));
const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses);
router.route("/:id").get(getCourse);

module.exports = router;
