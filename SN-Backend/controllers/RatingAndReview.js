const RatingAndReview = require("../models/RatingAndReviews");
const Course = require("../models/Course");
const mongoose = require("mongoose");

exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rating, review, courseId } = req.body;

    if (!rating || !review || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Required Details Not Found",
      });
    }

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(403).json({
        success: false,
        message: "Student is Not Enrolled in the Course",
      });
    }

    // const alreadyReviewed = await RatingAndReview.findOne({
    //   user: userId,
    //   course: courseId,
    // });

    // if (!alreadyReviewed) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course is Already Reviewed by the User",
    //   });
    // }

    const ratingAndReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingAndReview._id,
        },
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Rating and Review Created Successfully",
      ratingAndReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create rating and review",
      error: error.message,
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body;

    const averageRating = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (averageRating.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: averageRating[0].avgRating,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Average Rating is 0, no Ratings Given Till Now",
      avgRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch average rating",
      error: error.message,
    });
  }
};

exports.getAllRatingAndReviews = async (req, res) => {
  try {
    const allRatingAndReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Reviews Fetched Successfully",
      data: allRatingAndReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
