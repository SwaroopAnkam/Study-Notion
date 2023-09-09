const express = require("express");
const router = require("Router");

const {sendOTP, 
       signUp, 
       login, 
       changePassword} = require("../controllers/Auth");


const {resetPasswordToken, 
       resetPassword} = require("../controllers/ResetPassword");       

const {auth} = require("../middlewares/auth");

router.post("/sendOTP", sendOTP);
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/changePassword", changePassword);

router.post("/resetPasswordToken", resetPasswordToken);
router.post("/resetPassword", resetPassword);


module.exports = router