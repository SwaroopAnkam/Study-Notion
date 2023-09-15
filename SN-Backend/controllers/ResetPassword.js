const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Your Email is Not Registered With us",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: resetToken,
        resetTokenExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    const url = `http://localhost:3000/update-password/${resetToken}`;

    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: ${url}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Email Sent Successfully, Please Check The Email And Change The Password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong While Sending Reset Password Mail",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Password And Confirm Password Do Not Match",
      });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is Invalid",
      });
    }

    if (user.resetTokenExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Token is Expired, Please Regenerate Your Token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword, token: null, resetTokenExpires: null },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password Reset Successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong While Updating Password in Database",
    });
  }
};
