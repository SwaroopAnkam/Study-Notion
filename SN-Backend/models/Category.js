const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    // minlength: 2,
    // maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    // minlength: 10,
    // maxlength: 500,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Category", categorySchema);
