const express = require("express");
const router = require("Router");

const {auth} = require("../middlewares/auth");
const {updateProfile,
       showProfileDetails,
       deleteAccount,
       updateDisplayPicture,
       getEnrolledCourses} = require("../controllers/Profile");


router.put("/updateProfile", auth, updateProfile);
router.get("showProfileDetails", auth, showProfileDetails);
router.delete("/deleteAccount", auth, deleteAccount);
router.put("updateDisplayPicture", auth, updateDisplayPicture);
router.get("/getEnrolledCourses", auth, getEnrolledCourses);       


module.exports = router