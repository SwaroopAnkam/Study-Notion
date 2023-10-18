const { razorpayInstance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mailTemplates/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");
const {
  paymentSuccessEmail,
} = require("../mailTemplates/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress")
const crypto = require("crypto");

exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.json({ success: false, message: "Please provide Course Id" });
  }

  let totalAmount = 0;

  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the course" });
      }

      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }

      totalAmount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  const currency = "INR";
  const options = {
    amount: totalAmount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
  };

  console.log("asdfghjkl");

  try {
    const paymentResponse = await razorpayInstance.orders.create(options);
    res.json({
      success: true,
      message: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, mesage: "Could not Initiate Order" });
  }
};

exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;
  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res);

    return res.status(200).json({ success: true, message: "Payment Verified" });
  }
  return res.status(200).json({ success: "false", message: "Payment Failed" });
};

const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please Provide data for Courses or UserId",
    });
  }

  for (const courseId of courses) {
    try {
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, message: "Course not Found" });
      }

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName}`
        )
      );
      console.log("Email Sent Successfully", emailResponse.response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;
  console.log("printing userid", userId);

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the fields" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    console.log("enrilled student", enrolledStudent);

    await mailSender(
      enrolledStudent.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(500)
      .json({ success: false, message: "Could not send email" });
  }
};

// exports.capturePayment = async (req, res) => {
//   try {
//     const courseId = req.body;
//     const userId = req.user.id;

//     if (!courseId) {
//       return res.status(400).json({
//         success: false,
//         message: "Please Provide a Valid Course ID",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Course ID",
//       });
//     }

//     try {
//       const courseDetails = await Course.findById(courseId);

//       if (!courseDetails) {
//         return res.status(404).json({
//           success: false,
//           message: "Course Details Not Found",
//         });
//       }

//       const user_Id = new mongoose.Types.ObjectId(userId);

//       if (courseDetails.studentsEnrolled.includes(user_Id)) {
//         return res.status(403).json({
//           success: false,
//           message: "Student is Already Enrolled in this Course",
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         success: false,
//         message: "Error Fetching Course Details",
//         error: error.message,
//       });
//     }

//     const amount = courseDetails.price;
//     const currency = process.env.CURRENCY || "INR";

//     const options = {
//       amount: amount * 100,
//       currency,
//       receipt: Math.random(Date.now()).toString(),
//       notes: {
//         courseId,
//         userId,
//       },
//     };

//     try {
//       const paymentResponse = await razorpayInstance.orders.create(options);
//       console.log(paymentResponse);

//       return res.status(200).json({
//         success: true,
//         courseName: courseDeatils.courseName,
//         courseDescription: courseDeatils.courseDescription,
//         thumbnail: courseDeatils.thumbnail,
//         orderId: paymentResponse.id,
//         currency: paymentResponse.currency,
//         amount: paymentResponse.amount,
//       });
//     } catch (error) {
//       cconsole.error(error);
//       return res.status(500).json({
//         success: false,
//         message: "Could Not Initiate Payment Order",
//         error: error.message,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Could Not Capture Payment",
//       error: error.message,
//     });
//   }
// };

// exports.verifySignature = async (req, res) => {
//   try {
//     const webhookSecret = process.env.WEBHOOK_SECRET;

//     const signature = req.headers["x-razorpay-signature"];
//     const payload = JSON.stringify(req.body);

//     const hashedWebHookSecret = crypto
//       .createHmac("sha256", webhookSecret)
//       .update(payload)
//       .digest("hex");

//     if (signature !== hashedWebHookSecret) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Signature",
//       });
//     }

//     const { courseId, userId } = req.body.payload.payment.entity.notes;

//     try {
//       const enrolledCourse = await Course.findByIdAndUpdate(
//         courseId,
//         {
//           $push: {
//             studentsEnrolled: userId,
//           },
//         },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course Not Found",
//         });
//       }

//       const enrolledStudent = await User.findByIdAndUpdate(
//         userId,
//         {
//           $push: {
//             courses: courseId,
//           },
//         },
//         { new: true }
//       );

//       if (!enrolledStudent) {
//         return res.status(500).json({
//           success: false,
//           message: "User Not Added to Enrollment",
//         });
//       }

//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         "Congratulations from Study Notion",
//         "Congratulations, you are enrolled in a new StudyNotion Course"
//       );

//       return res.status(200).json({
//         success: true,
//         message: "Signature Verified and Course Enrolled Successfully",
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({
//       success: false,
//       message: "Invalid Request",
//     });
//   }
// };
