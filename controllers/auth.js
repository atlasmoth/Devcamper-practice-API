const path = require("path");
const errorResponse = require(path.join(__dirname, "/../utils/errorResponse"));
const catchAsync = require(path.join(__dirname, "/../utils/catchAsync"));
const User = require("./../models/user");
const jwt = require("jsonwebtoken");
//
function sendTokenResponse(user, statusCode, res) {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token
    });
}
exports.register = catchAsync(async function(req, res, next) {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  // create token
  sendTokenResponse(user, 200, res);
});
// login user
exports.login = catchAsync(async function(req, res, next) {
  // validate email and password
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new errorResponse("Please provide an email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new errorResponse("Invalid credentials", 401));
  }
  // check if password matches
  if (!user.matchPassword(password)) {
    return next(new errorResponse("Invalid credentials", 401));
  }
  sendTokenResponse(user, 200, res);
});

exports.protect = catchAsync(async function(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new errorResponse("Not authorized to access this route", 401));
  }
  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new errorResponse("Not authorized to access this route", 401)
      );
    }
    req.user = user;
    next();
  } catch (error) {
    new errorResponse("Not authorized to access this route", 401);
  }
});

exports.getMe = catchAsync(async function(req, res, next) {
  const user = await User.findById(req.user.id);
  res.send({
    status: "success",
    user
  });
});

// Grant access to specific roles
exports.authorize = function(...roles) {
  return (req, res, next) => {
    if (!roles.find(item => req.user.role === item)) {
      return next(new errorResponse("Unauthorized user", 403));
    }
    next();
  };
};
