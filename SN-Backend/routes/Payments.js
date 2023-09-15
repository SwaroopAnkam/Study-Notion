const express = require("express");
const router = express.Router();

const { capturePayment, verifySignature } = require("../controllers/Payments");
const {
  auth,
  isStudent,
  isInstructor,
  isAdmin,
} = require("../middlewares/auth");

router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifySignature", verifySignature);

module.exports = router;
