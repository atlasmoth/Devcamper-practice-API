const mongoose = require("mongoose");
const slugify = require("slugify");
const path = require("path");
const geocoder = require(path.join(__dirname, "/../utils/geocoder"));
const Course = require(path.join(__dirname, "/course"));
// setting up the schema and model
const bootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A bootcamp must have a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    slug: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please add a valid URL with  HTTPS"
      ]
    },
    phone: {
      type: String,
      max: [20, "Phone number cannot be longer than 20 characters"]
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add a valid email"
      ]
    },
    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other"
      ]
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"]
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg"
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    address: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
bootcampSchema.virtual("courses", {
  ref: "Course",
  foreignField: "bootcamp",
  localField: "_id",
  justOne: false
});

// Create bootcamp slug from name
bootcampSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
bootcampSchema.pre("save", async function(next) {
  const [loc] = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc.longitude, loc.latitude],
    formattedAddress: loc.formattedAddress,
    city: loc.city,
    street: loc.streetName,
    country: loc.countryCode,
    zipcode: loc.zipcode,
    state: loc.stateCode
  };
  this.address = undefined;
  next();
});
bootcampSchema.pre(/^find/, function(next) {
  this.populate("courses");
  next();
});
bootcampSchema.pre("remove", async function(next) {
  console.log(`Courses being removed from bootcamp ${this_id} `);
  await this.model("Course").deleteMany({ boocamp: this._id });
  next();
});
// Geocode & create location field
module.exports = mongoose.model("Bootcamp", bootcampSchema);
