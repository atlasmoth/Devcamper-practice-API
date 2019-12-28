const path = require("path");
const ErrorResponse = require(path.join(__dirname, "/../utils/errorResponse"));

module.exports = function(err, req, res, next) {
  let error = { ...err };
  console.log(`${err.name} : ${err.message}`.red);
  // mongoose bad ObjectID
  if (err.name === "CastError") {
    const message = `Bootcamp not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error"
  });
};
