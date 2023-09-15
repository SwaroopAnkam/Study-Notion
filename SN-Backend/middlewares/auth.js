const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
      });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log(payload);
      req.user = payload;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is Invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong While Validating The Token",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route For Students Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot be Verified, Please Try Again",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route For Instructor Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot be Verified, Please Try Again",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    console.log(req.user.accountType);
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route For Admin Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot be Verified, Please Try Again",
    });
  }
};
