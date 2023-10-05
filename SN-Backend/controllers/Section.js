const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties, All Fields Are Required",
      });
    }

    const newSection = await Section.create({ sectionName });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSections",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Section Created Successfully",
      updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to Create Section, Please Try Again",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body;
    if (!sectionName || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties, Please Fill All The Details",
      });
    }

    const section = await Section.findByIdAndUpdate(
       sectionId ,
      { sectionName },
      { new: true }
    );

    const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSections",
			},
		})
		.exec();

    return res.status(200).json({
      success: true,
      message:section,
      data:course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to Update Section, Please Try Again",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId }  = req.body;
    console.log("printing sectionId ", sectionId);
    console.log("printing courseId ", courseId);

    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties, Please Fill All The Details",
      });
    }

    const section = await Section.findById(sectionId);
    if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

    await SubSection.deleteMany({_id: {$in: section.subSections}});

		await Section.findByIdAndDelete(sectionId);

    const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSections"
			}
		})
		.exec();
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
      course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to Delete Section, Please Try Again",
      error: error.message,
    });
  }
};
