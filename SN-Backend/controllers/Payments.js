const Course = require("../models/Course");
const User = require("../models/User");
const {instance} = require("../config/razorpay");
const mailSender = require("../utils/mailSender");
require("dotenv").config;

exports.capturePayment = async(req, res) => {
    try{
        const courseId = req.body;
        const userId = req.user._id;

        if(!courseId){
            return res.status(403).json({
                success : false,
                message : "Please Provide The Valid Course ID",
            })
        }

        try{
            const couurseDetails = await Course.findById(courseId);
            
            if(!courseDetails){
                return res.staus(403).json({
                    success : false,
                    message : "Could Not Find The Course Details",
                });
            }

            const user_Id = new mongoose.Types.ObjectId(userId); 

            if(courseDetails.studentsEnrolled.includes(user_Id)){
                return res.status(403).json({
                    success : false,
                    message : "Student is Already Enrolled",
                });
            }
        }
        catch(error){
            console.error(error);
            return res.status(500).json({
                success : false,
                message : error.message,
        });
        }

        const amount = courseDetails.price;
        const currency = process.env.CURRENCY;

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
            const paymentResponse = await instance.orders.create(options);
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
            console.log(error);
            res.status(401).json({
                success : false,
                message : "Could Not Initiate Order",
        });
        }
    }
    catch(error){
        console.log(error);
            res.status(401).json({
                success : false,
                message : "Could Not Capture Payment",
        });
    }
}

exports.verifySignature = async(req, res) => {
    try{
        const webhookSecret = process.env.WEBHOOK_SECRET;
        
        const signature = req.headers["x-razorpay-signature"];

        const hashedWebHookSecret = crypto.createHmac("sha256", webhookSecret);
        hashedWebHookSecret.update(JSON.stringify(req.body));
        const digest = hashedWebHookSecret.digest("hex");

        if(signature == digest){
            console.log("Payment Is Authorised");

            const {courseId, userId} = req.body.payload.payment.entity.notes;

            try{
                const enrolledCourse = await Course.findByIdAndUpdate(
                                                {_id : courseId},
                                                {$push:
                                                    {studentsEnrolled : userId}
                                                },
                                                {new : true},
                )

                if(!enrolledCourse){
                    return res.status(500).json({
                        success : false,
                        message : "Course Not Found",
                    });
                }

                console.log(enrolledCourse);

                const enrolledStudent = await User.findByIdAndUpdate(
                                                    {_id : userId},
                                                    {$push : 
                                                        {courses:courseId}
                                                    },
                                                    {new : true},
                )

                if(!enrolledStudent){
                    return res.status(500).json({
                        success : false,
                        message : "User Not Added Into Enrollment",
                    });
                }
                console.log(enrolledStudent);
 
                const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratulations from Study Notion",
                                        "Congratulations, you are onboarded into new StudyNotion Course",
                );

                console.log(emailResponse);
                return res.status(200).json({
                    success : true,
                    message : "Signature Verified and Course Added Successfully",
                });

            } 
            catch(error){
                console.log(error);
                return res.status(500).json({
                    success : false,
                    message : error.message,
            });
            }
        }
    }
    catch(error){
        return res.status(400).json({
            success : false,
            message : "Invalid request",
        });
    }
}