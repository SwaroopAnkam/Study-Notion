const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const {uploadMediaToCloudinary} = require("../utils/mediaUploader");
require("dotenv").config;

exports.createCourse = async(req, res) => {
    try{
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.status(400).json({
                success : false,
                message : "All Fields Are Required, Please Fill All The Details",
            });
        }

        const instructorId = req.user._id;
        

        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success : false,
                message : "Category Details Not Found",
            });
        }

        const thumbnailImage = await uploadMediaToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorId,
            whatYouWillLearn : whatYouWillLearn,
            price,
            category : categoryDetails._id,
            thumbnail : thumbnailImage.secure_url,
        })

        await User.findByIdAndUpdate(
            {_id : instructorId},
            {
                $push: {
                    courses : newCourse._id,
                }
            },
            {new : true},
        )

        await Category.findByIdAndUpdate(
            {_id : categoryDetails._id},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true},
        )

        return res.status(200).json({
            success : true,
            message : "Course Created Successfully",
            data : newCourse,
        });
        


    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            message : 'Failed to Create Course',
            error : error.message,
        })
    }
}

exports.showAllCourses = async(req, res) => {
    try{
        const allCourses = await Course.find({}, {
            courseName : true,
            courseDescription : true,
            whatYouWillLearn : true,
            price : true,
            category : true,
            thumbnail : true,
        })
        res.status(200).json({
            success : true,
            message :  "All Courses Returned Successfully",
            allCourses,
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Cannot Fetch Course Data",
            error : error.message,
        })
    }
}

exports.getAllCourseDetails = async(req, res) => {
    try{
        const courseId = req.body;

        const allCourseDetails = await Course.find(
            {_id : courseId})
            .populate(
                {
                    path : "instructor",
                    populate : {
                        path : "additionalDetails",
                    },
                }
            )
            .populate("category")
            .populate("ratingAndreviews")
            .populate({
                path : "courseContent",
                populate : {
                    path : "subSection",
                },
            })
            .exec();

            if(!allCourseDetails) {
                return res.status(400).json({
                    success : false,
                    message : `Could Not Find the Course with ${courseId}`,
                });
            }
            //return response
            return res.status(200).json({
                success : true,
                message : "Course Details fetched successfully",
                data : courseDetails,
            })    
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : error.message,
        });
    }
}