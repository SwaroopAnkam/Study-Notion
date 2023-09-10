const Course = require("../models/Course");
const User = require("../models/User");
const { razorpayInstance } = require("../config/razorpay");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto"); 
require("dotenv").config();

exports.capturePayment = async(req, res) => {
    try{
        const courseId = req.body.courseId;
        const userId = req.user._id;

        if (!courseId) {
            return res.status(400).json({
              success : false,
              message : "Please Provide a Valid Course ID",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
              success : false,
              message : "Invalid Course ID",
            });
        }
      

        try{
            const couurseDetails = await Course.findById(courseId);
            
            if (!courseDetails) {
                return res.status(404).json({
                  success : false,
                  message : "Course Details Not Found",
                });
            }

            const user_Id = new mongoose.Types.ObjectId(userId); 

            if(courseDetails.studentsEnrolled.includes(user_Id)){
                return res.status(403).json({
                    success : false,
                    message : "Student is Already Enrolled in this Course",
                });
            }
        }
        catch(error){
            console.error(error);
            return res.status(500).json({
                success : false,
                message : "Error Fetching Course Details",
                error : error.message,
      });
        }

        const amount = courseDetails.price;
        const currency = process.env.CURRENCY || "INR";

        const options = {
            amount : amount * 100,
            currency,
            receipt : Math.random(Date.now()).toString(),
            notes : {
                courseId,
                userId,
            }
        }

        try{
            const paymentResponse = await razorpayInstance.orders.create(options);
            console.log(paymentResponse);

            return res.status(200).json({
                success : true,
                courseName : courseDeatils.courseName,
                courseDescription : courseDeatils.courseDescription,
                thumbnail : courseDeatils.thumbnail,
                orderId : paymentResponse.id,
                currency : paymentResponse.currency,
                amount : paymentResponse.amount,
            });
        }
        catch(error){
            cconsole.error(error);
            return res.status(500).json({
              success : false,
              message : "Could Not Initiate Payment Order",
              error : error.message,
        });
        }
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            message : "Could Not Capture Payment",
            error : error.message,
    });
    }
}

exports.verifySignature = async(req, res) => {
    try{
        const webhookSecret = process.env.WEBHOOK_SECRET;
        
        const signature = req.headers["x-razorpay-signature"];
        const payload = JSON.stringify(req.body);

        const hashedWebHookSecret = crypto
        .createHmac("sha256", webhookSecret)
        .update(payload)
        .digest("hex");
  
        if (signature !== hashedWebHookSecret) {
            return res.status(400).json({
              success : false,
              message : "Invalid Signature",
            });
        }
      
        const { courseId, userId } = req.body.payload.payment.entity.notes;
      
        try {
            const enrolledCourse = await Course.findByIdAndUpdate(
              courseId,
              {
                $push : {
                  studentsEnrolled : userId,
                },
              },
              { new : true }
            );
      
            if (!enrolledCourse) {
              return res.status(500).json({
                success : false,
                message : "Course Not Found",
              });
            }
      
            const enrolledStudent = await User.findByIdAndUpdate(
              userId,
              {
                $push : {
                  courses : courseId,
                },
              },
              { new : true }
            );
      
            if (!enrolledStudent) {
              return res.status(500).json({
                success : false,
                message : "User Not Added to Enrollment",
              });
            }
      
            const emailResponse = await mailSender(
              enrolledStudent.email,
              "Congratulations from Study Notion",
              "Congratulations, you are enrolled in a new StudyNotion Course"
            );
      
            return res.status(200).json({
              success : true,
              message : "Signature Verified and Course Enrolled Successfully",
            });
          } catch (error) {
            console.error(error);
            return res.status(500).json({
              success : false,
              message : error.message,
            });
          }
        } catch (error) {
          console.error(error);
          return res.status(400).json({
            success : false,
            message : "Invalid Request",
        });
    }
};