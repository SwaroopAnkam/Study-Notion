const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  timeDuration: {
    type: String,
    // required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  videoUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("SubSection", subSectionSchema);
