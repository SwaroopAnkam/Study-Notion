const express = require("express");
const router = express.Router(); 

const { auth } = require("../middlewares/auth");
const {
    updateProfile,
    getUserDetails,
    deleteAccount,
    updateDisplayPicture,
    getEnrolledCourses
} = require("../controllers/Profile");

router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getUserDetails); 
router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

module.exports = router;

