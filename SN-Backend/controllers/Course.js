const Course = require("../models/Course");
const User = require("../models/User");
const Tag = require("../models/Tags");
const {uploadMediaToCloudinary} = require("../utils/mediaUploader");

exports.createCourse = async(req, res) => {
    try{
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success : false,
                message : "All Fields Are Required, Please Fill All The Details",
            });
        }

        const instructorId = req.user._id;
        

        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success : false,
                message : "Tag Details Not Found",
            });
        }

        const thumbnailImage = await uploadMediaToCloudinary(thumbnail, process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorId,
            whatYouWillLearn : whatYoutWillLearn,
            price,
            tag : tagDetails._id,
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

        await Tag.indByIdAndUpdate(
            {_id : tagDetails._id},
            {
                $push: {
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
            tag : true,
            thumbnail : true,
        })
        res.status(200).json({
            success : true,
            message :  "All Courses Returned Successfully",
            allTags,
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