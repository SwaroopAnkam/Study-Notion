const mongoose = require("mongoose");

const ratingAndReviewsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
    index: true,
  },
});

module.exports = mongoose.model("RatingAndReviews", ratingAndReviewsSchema);
