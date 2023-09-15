const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadMediaToCloudinary } = require("../utils/mediaUploader");
const mongoose = require("mongoose");

exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to update the profile fields",
      });
    }

    const userDetails = await User.findById(userId);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    profileDetails.gender = gender;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Printing ID: ", req.user.id);

    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    await User.findByIdAndDelete({ _id: userId });
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user account",
      error: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    const updatedImage = await uploadMediaToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    console.log(updatedImage);

    if (!updatedImage) {
      return res.status(500).json({
        success: false,
        message: "Failed to update profile picture",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: updatedImage.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
      error: error.message,
    });
  }
};
