const express = require("express");
const router = express.Router();

const {
  sendOTP,
  signUp,
  login,
  changePassword,
} = require("../controllers/Auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");

const { auth } = require("../middlewares/auth");

router.post("/sendOTP", sendOTP);
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/changePassword", auth, changePassword);

router.post("/reset-Password-Token", resetPasswordToken);
router.post("/reset-Password", resetPassword);

module.exports = router;
