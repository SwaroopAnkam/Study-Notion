const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadMediaToCloudinary } = require("../utils/mediaUploader");
require("dotenv").config;

exports.createSubSection = async(req, res) => {
    try{
        const {sectionId, title, timeDuration, description} = req.body;
        const video = req.files.videoFile;

        if(!sectionId || !title || !timeDuration || !description || !video){
             return res.status(400).json({
                success:false,
                message:"All Fields Are Required",
            });
        }

        const uploadVideo = await uploadMediaToCloudinary(video, process.env.FOLDER_NAME);

        const newSubSection = await SubSection.create({
            title : title,
            timeDuration : timeDuration,
            description : description,
            videoUrl : uploadDetails.secure_url,
        })

        const updatedSectionDetails = await Section.findByIdAndUpdate(
                                                            {_id : sectionId},
                                                            {$push : {
                                                                subSection : subSectionDetails._id,
                                                            }},
                                                            {new : true}).populate("SubSection").exec();
        console.log(updatedSectionDetails);                                                    
        return res.status(200).json({
                    succcess : true,
                    message : "SubSection Created Successfully",
                    updatedSection,
                });                                                     
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Internal Server Error",
            error : error.message,
        })
    }
}

// needed to define updateSubSection and deleteSubSection handlers