const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a course title"]
    },
    description: {
      type: String,
      required: [true, "Please add a description"]
    },
    weeks: {
      type: String,
      required: [true, "Please add number of weeks"]
    },
    tuition: {
      type: Number,
      required: [true, "Please add a tuition cost"]
    },
    minimumSkill: {
      type: String,
      required: [true, "Please add a minimum skill"],
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false
    },
    bootcamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bootcamp",
      required: true
    }
  },
  {
    timestamps: true
  }
);
courseSchema.statics.getAverageCost = async function(bootcampId) {
  const [obj] = await this.aggregate([
    {
      $match: { bootcamp: mongoose.Types.ObjectId(bootcampId) }
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" }
      }
    }
  ]);
  try {
    await this.model("bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: obj.averageCost
    });
  } catch (error) {
    console.log(error.message);
  }
};
// call getAverageCost after save and before remove
courseSchema.post("save", function() {
  //
  this.constructor.getAverageCost(this._id);
});

courseSchema.pre("remove", function() {
  //
  this.constructor.getAverageCost(this._id);
});

module.exports = mongoose.model("Course", courseSchema);
