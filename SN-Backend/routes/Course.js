const express = require("express");
const router = express.Router();

const {
  createCourse,
  showAllCourses,
  getCourseDetails,
  getInstructorCourses,
  editCourse,
  getFullCourseDetails,
  deleteCourse,
} = require("../controllers/Course");

const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
} = require("../controllers/Category");

const {
  createRating,
  getAverageRating,
  getAllRatingAndReviews,
} = require("../controllers/RatingAndReview");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/SubSection");

const {
  updateCourseProgress
} = require("../controllers/CourseProgress");

const {
  auth,
  isStudent,
  isInstructor,
  isAdmin,
} = require("../middlewares/auth");

router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection)
router.post("/deleteSection", auth, isInstructor, deleteSection)
router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
router.get("/showAllCourses", showAllCourses);
router.post("/getCourseDetails", getCourseDetails);
router.post("/editCourse", auth, isInstructor, editCourse);
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
router.delete("/deleteCourse", deleteCourse)
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getAllRatingAndReviews", getAllRatingAndReviews);

module.exports = router;
