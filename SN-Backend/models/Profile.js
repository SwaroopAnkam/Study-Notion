const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    // enum : ["Male", "Female", "Other"],
  },
  dateOfBirth: {
    type: String,
    // match : /^\d{4}-\d{2}-\d{2}$/,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    trim: true,
    // match : /^\d{3}-\d{3}-\d{4}$/,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
