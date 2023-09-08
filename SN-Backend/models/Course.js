const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    
    courseName : {
        type : String,
        required : true,
    },
    courseDescription : {
        type : String,
        required : true,
        trim : true,
    },
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    whatYouWillLearn : {
        type : String,
        required : true,
        trim : true,
    },
    courseContent : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Section",
            required : true,
        }
    ],
    ratingAndReviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "RatingAndReviews",
        }
    ],
    price : {
        type : Number,
        required : true,
    },
    thumbnail : {
        type : String,
        required : true,
    },
    tag : {
        type : [string],
        required : true,
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
        required : true,
    },
    studentsEnrolled : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
        }
    ],
    instructions : {
		type : [String],
	},
	status : {
		type : String,
		enum : ["Draft", "Published"],
	},
});

module.exports = mongoose.model("Course", courseSchema );