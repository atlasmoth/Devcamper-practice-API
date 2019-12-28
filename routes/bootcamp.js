const express = require("express");
const path = require("path");
const courseRouter = require("./course");
const {
  getBootcamps,
  createBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require(path.join(__dirname, "/../controllers/bootcamp"));
const { protect, authorize } = require(path.join(
  __dirname,
  "/../controllers/auth"
));
const router = express.Router();
router.use("/:bootcampId/courses", courseRouter);
router.get("/radius/:zipcode/:distance", getBootcampsInRadius);
router.put("/:id/photo", bootcampPhotoUpload);
router
  .route("/")
  .get(protect, authorize("publisher", "admin"), getBootcamps)
  .post(createBootcamp);

router
  .route("/:id")
  .get()
  .patch()
  .delete();

module.exports = router;
