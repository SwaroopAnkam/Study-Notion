const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req, res) => {
    try{
        const {sectionName, courseId} = req.body;
        if(!sectionName || !courseId){
            return res.status(400).json({
                success : false,
                message : "Missing Properties, All Fields Are Required",
            });
        }
        
        const newSection = await Section.create({sectionName});

        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push : {
                                                    courseContent : newSection._id,
                                                }
                                            },
                                            {new : true},
                                        ).populate({
                                            path : "Section",
                                            populate : {
                                              path : "SubSection", 
                                            },
                                          }).exec();

        return res.status(200).json({
            success : true,
            message : "Section Created Successfully",
            updatedCourseDetails,
        })                                  
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Unable to Create Section, Please Try Again",
            error : error.message,
        });
    }
    
}


exports.updateSection = async(req, res) => {
    try{

        const {sectionName, sectionId} = req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success : false,
                message : "Missing Properties, Please Fill All The Details",
            });
        }

        const updatedSection = await Section.findByIdAndUpdate(
                                        {sectionId},
                                        {sectionName}, 
                                        {new:true},
                                    )
        return res.status(200).json({
            success : true,
            message : "Section Updated Successfully",
            updatedSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Unable to Update Section, Please Try Again",
            error : error.message,
        });
    }
}



exports.deleteSection = async(req, res) => {
    try{
        const {sectionId} = req.params
        const {courseId} = req.body

        if(!sectionId || !courseId){
            return res.status(400).json({
                success : false,
                message : "Missing Properties, Please Fill All The Details",
            });
        }

        await Section.findByIdAndDelete(sectionId);
        
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            {courseId},
                                            {
                                                $pull : {
                                                courseContent : section._id,
                                            }
                                        },
                                        {new : true},
                                        ).populate({
                                            path : "Section",
                                            populate : {
                                                path : "SubSection", 
                                            },
                                        }).exec();
        return res.status(200).json({
            success : true,
            message : "Section Deleted Successfully",
            updatedCourseDetails,
        })                                
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Unable to Delete Section, Please Try Again",
            error:error.message,
        });
    }
}