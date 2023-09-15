const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadMediaToCloudinary } = require("../utils/mediaUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;
    const video = req.files.videoFile;

    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    const uploadVideo = await uploadMediaToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadVideo.secure_url,
    });

    const updatedSectionDetails = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    )
      .populate("subSections")
      .exec();
    console.log(updatedSectionDetails);
    return res.status(200).json({
      succcess: true,
      message: "SubSection Created Successfully",
      updatedSectionDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId, title, description } = req.body;

    const subSectionDetails = await SubSection.findById(subSectionId);

    if (!subSectionDetails) {
      return res.status(404).json({
        success: false,
        message: "SubSection Not Found",
      });
    }

    if (title !== undefined || title) {
      subSectionDetails.title = title;
    }

    if (description !== undefined || description) {
      subSectionDetails.description = description;
    }

    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadVideo = await uploadMediaToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSectionDetails.videoUrl = uploadVideo.secure_url;
      subSectionDetails.timeDuration = `${uploadDetails.duration}`;
    }
    await subSection.save();

    return res.json({
      success: true,
      message: "SubSection Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Updating the SubSection",
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection Not Found",
      });
    }

    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );

    return res.json({
      success: true,
      message: "SubSection Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Deleting the SubSection",
    });
  }
};
