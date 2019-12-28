const path = require("path");
const Course = require(path.join(__dirname, "/../models/course"));
const catchAsync = require(path.join(__dirname, "/../utils/catchAsync"));
const errorResponse = require(path.join(__dirname, "/../utils/errorResponse"));

exports.getCourses = catchAsync(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find({}).populate({
      path: "bootcamp",
      model: "Bootcamp"
    });
  }
  const courses = await query;
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});
exports.getCourse = catchAsync(async (req, res, next) => {
  //
  console.log("It is indeed this shit that is running");
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
    model: "Bootcamp"
  });
  if (!course) return next(new errorResponse("Course not found", 400));
  res.send({
    stauts: "success",
    data: course
  });
});

exports.addCourse = catchAsync(async (req, res, next) => {
  const course = await Course.create({
    ...req.body,
    bootcamp: req.parmas.bootcampId
  });
  res.send({
    stauts: "success",
    data: course
  });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  //
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );
  if (!course)
    return next(new errorResponse("Course not found belonging to ID", 400));
  res.send({
    status: "success",
    data: course
  });
});
