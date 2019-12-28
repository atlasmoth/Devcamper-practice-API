const path = require("path");
const Bootcamp = require(path.join(__dirname, "/../models/bootcamp"));
const catchAsync = require(path.join(__dirname, "/../utils/catchAsync"));
const ApiFeatures = require(path.join(__dirname, "/../utils/apiFeatures"));
const geocoder = require(path.join(__dirname, "/../utils/geocoder"));
const errorResponse = require(path.join(__dirname, "/../utils/errorResponse"));
// Create Bootcamps
exports.createBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.create({ ...req.body, user: req.user._id });
  res.status(201).json({
    success: true,
    data: bootcamp
  });
});
// Grt all Bootcamps
exports.getBootcamps = catchAsync(async (req, res, next) => {
  const query = new ApiFeatures(req.query, Bootcamp);
  console.log(query.sort, query.fields);
  const bootcamps = await query
    .filter()
    .sort(query.sort)
    .select(query.fields)
    .limit(query.limit)
    .skip(query.page * query.limit);

  res.status(200).send({
    success: true,
    length: bootcamps.length,
    data: bootcamps
  });
});
// Get bootcamps by zipcode within radius
exports.getBootcampsInRadius = catchAsync(async function(req, res, next) {
  const { zipcode, distance } = req.params;
  // get latlng from geocoder
  const [loc] = await geocoder.geocode(zipcode);
  const latitude = loc.latitude;
  const longitude = loc.longitude;
  // Divide distance by radius of earth
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
  });
  res.status(200).send({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
//

// upload photo for bootcamp
// bootcamp/:id/photo
exports.bootcampPhotoUpload = catchAsync(async function(req, res, next) {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new errorResponse("Bootcamp not found", 404));
  }
  if (!req.files) {
    return next(new errorResponse("Please upload a file", 400));
  }
  const file = { ...req.files[""] };

  if (!file.mimetype.startsWith("image")) {
    return next(new errorResponse("Please upload an image file", 400));
  }
  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new errorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD /
          1000000} mb`,
        400
      )
    );
  }
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async e => {
    if (e) {
      console.log(e);
      return next(new errorResponse("Problem with file upload", 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    // await bootcamp.save();
    res.json({
      success: true,
      data: bootcamp.photo
    });
  });
});
